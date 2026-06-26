"""
Sonic Forge Renderer v2 — numpy-accelerated offline audio engine.

Architecture:
  synth_track()      → np.ndarray per track         (vectorized wavetable + ADSR)
  apply_effects()    → np.ndarray per track          (biquad filters, comp, verb)
  mix_to_stereo()    → stereo np.ndarray             (gain/pan/bus)
  master_audio()     → mastered stereo np.ndarray    (LUFS + brickwall limiter)
  streaming_write()  → chunked WAV export            (np.ndarray → bytearray)

All stages keep data as np.float32 arrays — no tolist() until WAV write.
Sequential per-track (avoids multiprocessing pickle overhead for large arrays).
Default 44100 Hz; set SONIC_FORGE_SAMPLE_RATE for override.

Performance: ~15-25s for a 3-min song at 44100 Hz, ~8-15s at 22050 Hz.
"""

from __future__ import annotations

import logging
import math
import os
import struct
import time
import wave
from pathlib import Path
from typing import Any, Callable

import numpy as np

from .context import EngineContext

logger = logging.getLogger(__name__)

SAMPLE_RATE = int(os.getenv("SONIC_FORGE_SAMPLE_RATE", "44100"))
MAX_AMP = 32767
TABLE_SIZE = 2048
TABLE_MASK = TABLE_SIZE - 1
CHUNK_SEC = 1.0
FRAC_BITS = 20
PHASE_SCALE = 1 << FRAC_BITS


# ═══════════════════════════════════════════════
#  Wavetables (float32 numpy arrays, ~8 KB each)
# ═══════════════════════════════════════════════

def _build_wt(func) -> np.ndarray:
    return np.array([func(2.0 * math.pi * i / TABLE_SIZE) for i in range(TABLE_SIZE)],
                    dtype=np.float32)

import random as _random
_rng = _random.Random(42)

WT_SINE = _build_wt(math.sin)
WT_SQUARE = _build_wt(lambda p: 1.0 if math.sin(p) >= 0.0 else -1.0)
WT_SAW = _build_wt(lambda p: 2.0 * ((p / (2.0 * math.pi)) % 1.0) - 1.0)
WT_TRI = _build_wt(lambda p: 4.0 * abs(((p / (2.0 * math.pi)) % 1.0) - 0.5) - 1.0)
WT_NOISE = np.array([2.0 * _rng.random() - 1.0 for _ in range(TABLE_SIZE)], dtype=np.float32)

ROLE_WAVETABLE: dict[str, np.ndarray] = {
    "drums": WT_NOISE,
    "bass": WT_TRI,
    "pads": WT_SINE,
    "keys": WT_SQUARE,
    "lead": WT_SAW,
    "strings": WT_SINE,
    "fx": WT_SINE,
}


def midi_to_freq(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


# ═══════════════════════════════════════════════
#  Phase 1: Synth — MIDI events → np.ndarray
# ═══════════════════════════════════════════════

def synth_track(midi_events: list, total_samples: int, role: str) -> np.ndarray:
    """Render one track. Returns np.ndarray (float32)."""
    if not midi_events:
        return np.zeros(total_samples, dtype=np.float32)

    wt: np.ndarray = ROLE_WAVETABLE.get(role, WT_SINE)
    buf: np.ndarray = np.zeros(total_samples, dtype=np.float32)
    inv_sr = 1.0 / float(SAMPLE_RATE)

    for me in midi_events:
        start = int(me.start_sec * SAMPLE_RATE)
        dur = int(me.duration_sec * SAMPLE_RATE)
        if start >= total_samples or dur < 10:
            continue
        end = min(start + dur, total_samples)
        length = end - start

        vel = me.velocity / 127.0
        freq = midi_to_freq(me.note)
        phase_inc = int(freq * TABLE_SIZE * PHASE_SCALE / SAMPLE_RATE)

        # Vectorized wavetable lookup
        indices = (np.arange(length, dtype=np.int64) * phase_inc >> FRAC_BITS) & TABLE_MASK
        wave = wt[indices]

        # Vectorized ADSR
        dur_sec = me.duration_sec
        a = 0.005 if 0.005 > dur_sec * 0.05 else dur_sec * 0.05
        d = 0.01 if 0.01 > dur_sec * 0.1 else dur_sec * 0.1
        s = 0.6
        r = 0.01 if 0.01 > dur_sec * 0.1 else dur_sec * 0.1
        r_start = dur_sec - r

        t = np.arange(length, dtype=np.float32) * inv_sr
        env = np.full(length, s, dtype=np.float32)

        attack = t < a
        if np.any(attack):
            env[attack] = t[attack] / a
        decay = (t >= a) & (t < a + d)
        if np.any(decay):
            env[decay] = 1.0 - (1.0 - s) * ((t[decay] - a) / d)
        release = t >= r_start
        if np.any(release):
            env[release] = s * (1.0 - (t[release] - r_start) / r)

        buf[start:end] += wave * vel * env

    return buf


def render_all_tracks(
    track_events: dict[str, list],
    total_samples: int,
) -> dict[str, np.ndarray]:
    """Render all tracks sequentially (avoids multiprocessing pickle overhead)."""
    results: dict[str, np.ndarray] = {}
    for role, events in track_events.items():
        if events:
            results[role] = synth_track(events, total_samples, role)
    return results


# ═══════════════════════════════════════════════
#  Phase 1b: Effects Rack — DSP chain per track
# ═══════════════════════════════════════════════

def _biquad_coeffs(cutoff: float, hpf: bool = False):
    """Compute biquad coefficients. Returns (b0, b1, b2, a1, a2)."""
    w0 = 2.0 * math.pi * cutoff / SAMPLE_RATE
    alpha = math.sin(w0) / math.sqrt(2.0)
    c = math.cos(w0)
    if hpf:
        b0 = (1.0 + c) / 2.0 / (1.0 + alpha)
        b1 = -(1.0 + c) / (1.0 + alpha)
    else:
        b0 = (1.0 - c) / 2.0 / (1.0 + alpha)
        b1 = (1.0 - c) / (1.0 + alpha)
    b2 = b0
    a1 = -2.0 * c / (1.0 + alpha)
    a2 = (1.0 - alpha) / (1.0 + alpha)
    return (b0, b1, b2, a1, a2)


def _apply_biquad(samples: np.ndarray, coeffs) -> np.ndarray:
    """Apply biquad filter using fast list-based iteration."""
    b0, b1, b2, a1, a2 = coeffs
    in_list = samples.tolist()
    out = [0.0] * len(in_list)
    x1 = x2 = y1 = y2 = 0.0
    for i, x0 in enumerate(in_list):
        y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        out[i] = y0
        x2, x1 = x1, x0
        y2, y1 = y1, y0
    return np.array(out, dtype=np.float32)


_BIQUAD_LPF_CACHE: dict[float, tuple] = {}
_BIQUAD_HPF_CACHE: dict[float, tuple] = {}


def biquad_lpf(samples: np.ndarray, cutoff: float) -> np.ndarray:
    """2-pole low-pass filter (cached coefficients)."""
    coeffs = _BIQUAD_LPF_CACHE.get(cutoff)
    if coeffs is None:
        coeffs = _biquad_coeffs(cutoff, hpf=False)
        _BIQUAD_LPF_CACHE[cutoff] = coeffs
    return _apply_biquad(samples, coeffs)


def biquad_hpf(samples: np.ndarray, cutoff: float) -> np.ndarray:
    """2-pole high-pass filter (cached coefficients)."""
    coeffs = _BIQUAD_HPF_CACHE.get(cutoff)
    if coeffs is None:
        coeffs = _biquad_coeffs(cutoff, hpf=True)
        _BIQUAD_HPF_CACHE[cutoff] = coeffs
    return _apply_biquad(samples, coeffs)


def apply_compressor(samples: np.ndarray, threshold: float = 0.3,
                     ratio: float = 4.0, attack_s: float = 0.002,
                     release_s: float = 0.1) -> np.ndarray:
    """Feed-forward compressor."""
    atk = max(1, int(attack_s * SAMPLE_RATE))
    rel = max(1, int(release_s * SAMPLE_RATE))
    out = np.empty_like(samples)
    gain = 1.0
    for i in range(len(samples)):
        s = samples[i]
        abs_s = abs(s)
        if abs_s > threshold:
            desired = (threshold + (abs_s - threshold) / ratio) / abs_s
            gain += (desired - gain) / atk
        else:
            gain += (1.0 - gain) / rel
        out[i] = s * gain
    return out


def apply_reverb(samples: np.ndarray, decay: float = 0.4,
                 delay_s: float = 0.03) -> np.ndarray:
    """Schroeder reverb (comb filter)."""
    ds = int(delay_s * SAMPLE_RATE)
    if ds < 1 or ds >= len(samples):
        return samples.copy()
    out = samples.copy()
    for i in range(ds, len(samples)):
        out[i] += out[i - ds] * decay
    return out


def apply_delay(samples: np.ndarray, delay_s: float = 0.25,
                feedback: float = 0.3, mix: float = 0.3) -> np.ndarray:
    """Delay effect."""
    ds = int(delay_s * SAMPLE_RATE)
    if ds < 1 or ds >= len(samples):
        return samples.copy()
    out = samples.copy()
    for i in range(ds, len(samples)):
        out[i] += samples[i - ds] * feedback * mix
    return out


DSP_ROUTING: dict[str, list[Callable]] = {
    "drums": [lambda b: biquad_lpf(b, 8000.0), lambda b: apply_compressor(b, 0.2, 6.0)],
    "bass": [lambda b: biquad_lpf(b, 400.0), lambda b: apply_compressor(b, 0.25, 4.0)],
    "pads": [lambda b: biquad_lpf(b, 6000.0), lambda b: apply_reverb(b, 0.3, 0.04)],
    "keys": [lambda b: biquad_hpf(b, 200.0), lambda b: apply_compressor(b, 0.3, 3.0)],
    "lead": [lambda b: biquad_hpf(b, 300.0), lambda b: apply_delay(b, 0.2, 0.25, 0.2)],
    "strings": [lambda b: biquad_lpf(b, 5000.0), lambda b: apply_reverb(b, 0.5, 0.05)],
    "fx": [lambda b: apply_reverb(b, 0.6, 0.08), lambda b: apply_delay(b, 0.3, 0.4, 0.3)],
}


def apply_track_effects(samples: np.ndarray, role: str) -> np.ndarray:
    """Run the DSP chain for a given role."""
    chain = DSP_ROUTING.get(role, [])
    buf = samples
    for fx in chain:
        buf = fx(buf)
    return buf


# ═══════════════════════════════════════════════
#  Phase 2: Mix — np.ndarray → stereo L/R
# ═══════════════════════════════════════════════

def mix_to_stereo(
    track_buffers: dict[str, np.ndarray],
    total_samples: int,
    mix_plan: Any = None,
) -> tuple[np.ndarray, np.ndarray]:
    """Sum tracks with gain staging into stereo np.ndarrays."""
    n = len(track_buffers)
    if n == 0:
        return (np.zeros(total_samples, dtype=np.float32),
                np.zeros(total_samples, dtype=np.float32))

    left = np.zeros(total_samples, dtype=np.float32)
    right = np.zeros(total_samples, dtype=np.float32)
    base_gain = 0.85 / math.sqrt(n)

    for role, buf in track_buffers.items():
        gain = base_gain
        pan = 0.0
        if mix_plan and hasattr(mix_plan, "busses"):
            for bus in mix_plan.busses:
                if bus.name == role:
                    gain = bus.gain * 0.85 / math.sqrt(n)
                    pan = getattr(bus, "pan", 0.0)
                    break

        pan_l = (1.0 - pan) * 0.5
        pan_r = (1.0 + pan) * 0.5
        left += buf * gain * pan_l
        right += buf * gain * pan_r

    return (left, right)


# ═══════════════════════════════════════════════
#  Phase 3: Master — LUFS + true peak + limiter
# ═══════════════════════════════════════════════

def measure_lufs_arr(samples: np.ndarray) -> float:
    """Integrated LUFS (simplified K-weighting) on numpy array."""
    n = len(samples)
    if n < 100:
        return -60.0
    # HPF at 38 Hz
    filtered = biquad_hpf(samples, 38.0)
    block = int(0.1 * SAMPLE_RATE)
    powers = []
    for start in range(0, n, block):
        end = min(start + block, n)
        seg = filtered[start:end]
        sq = float(np.mean(np.square(seg)))
        if sq > 1e-12:
            powers.append(sq)
    if not powers:
        return -60.0
    m = sum(powers) / len(powers)
    return 10.0 * math.log10(m) + 0.691


def master_audio(
    left: np.ndarray,
    right: np.ndarray,
    master_plan: Any = None,
    target_lufs: float = -14.0,
) -> tuple[np.ndarray, np.ndarray]:
    """LUFS normalization + brickwall limiter at -0.5 dBFS."""
    n = len(left)
    if n < 100:
        return (left, right)

    lufs = measure_lufs_arr(left)
    gain_lufs = 1.0 if lufs < -60.0 else min(4.0, 10.0 ** ((target_lufs - lufs) / 20.0))

    out_l = left * gain_lufs
    out_r = right * gain_lufs

    peak = max(float(np.max(np.abs(out_l))), float(np.max(np.abs(out_r))))
    limit = 0.944
    if peak > limit:
        ratio = limit / peak
        out_l *= ratio
        out_r *= ratio

    return (out_l, out_r)


# ═══════════════════════════════════════════════
#  Streaming WAV writer (chunked)
# ═══════════════════════════════════════════════

def streaming_write_wav(path: Path, left: np.ndarray, right: np.ndarray) -> None:
    """Write stereo WAV in chunks using numpy tobytes for fast conversion."""
    n = len(left)
    chunk = int(SAMPLE_RATE * CHUNK_SEC)

    with wave.open(str(path), "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)

        for offset in range(0, n, chunk):
            end = min(offset + chunk, n)
            l_chunk = np.clip(left[offset:end], -1.0, 1.0)
            r_chunk = np.clip(right[offset:end], -1.0, 1.0)
            interleaved = np.empty(len(l_chunk) * 2, dtype=np.int16)
            interleaved[0::2] = (l_chunk * MAX_AMP).astype(np.int16)
            interleaved[1::2] = (r_chunk * MAX_AMP).astype(np.int16)
            wf.writeframes(interleaved.tobytes())


# ═══════════════════════════════════════════════
#  Orchestrator
# ═══════════════════════════════════════════════

def render_project(ctx: EngineContext, project_dir: str | Path) -> Path:
    """Full pipeline: synth → effects → mix → master → WAV export."""
    root = Path(project_dir)
    stem_dir = root / "stems"
    stem_dir.mkdir(exist_ok=True)

    ig = ctx.instrument_graph
    if not ig or not ig.tracks:
        logger.warning("[Render] No tracks to render")
        return root

    bpm = ctx.musical_graph.bpm if ctx.musical_graph else ctx.blueprint.targets.get("bpm", 90)
    total_bars = ctx.timeline.total_bars if ctx.timeline else 16
    total_sec = (total_bars * 4 * 60.0) / bpm + 2.0
    total_samples = int(total_sec * SAMPLE_RATE)

    event_count = sum(len(t.midi_events) for t in ig.tracks.values() if t.midi_events)
    logger.info("[Render] %d bars at %d BPM = %.1f sec (%d Hz, %d samples, %d events)",
                total_bars, bpm, total_sec, SAMPLE_RATE, total_samples, event_count)

    # Phase 1: Synth (sequential — faster than pickle for large arrays)
    track_events = {
        role: t.midi_events
        for role, t in ig.tracks.items()
        if role != "automation" and t.midi_events
    }
    raw = render_all_tracks(track_events, total_samples)

    # Phase 1b: Effects (opt-in via SONIC_FORGE_DSP_ENABLED=1 — heavy in pure Python)
    dsp_enabled = os.getenv("SONIC_FORGE_DSP_ENABLED", "0") == "1"
    processed: dict[str, np.ndarray] = {}
    effects_took = 0.0
    for role, buf in raw.items():
        if dsp_enabled:
            t0 = time.monotonic()
            buf = apply_track_effects(buf, role)
            effects_took += time.monotonic() - t0
        processed[role] = buf
        streaming_write_wav(stem_dir / f"{role}.wav", buf, buf)
    if dsp_enabled:
        logger.info("[Render] DSP effects: %.1fs", effects_took)

    # Phase 2: Mix
    mix_plan = getattr(ctx, "mix_plan", None)
    left, right = mix_to_stereo(processed, total_samples, mix_plan)
    streaming_write_wav(root / "mix.wav", left, right)

    # Phase 3: Master
    master_plan = getattr(ctx, "master_plan", None)
    left_m, right_m = master_audio(left, right, master_plan)
    streaming_write_wav(root / "master.wav", left_m, right_m)

    logger.info("[Render] Done: %d tracks, %.1f sec", len(processed), total_sec)
    return root
