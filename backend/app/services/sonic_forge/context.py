"""
EngineContext — typed shared state across every Sonic Forge pipeline stage.

Each stage reads from and writes to this context. No ad hoc dicts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Blueprint:
    """Production plan — no audio yet, just intent + structure."""
    track_id: str = ""
    creator_id: str = ""
    intent: dict = field(default_factory=lambda: {
        "genre": "West Coast Soul",
        "mood": "Reflective",
        "theme": "",
        "language": "English",
    })
    structure: list[dict] = field(default_factory=lambda: [
        {"section": "intro", "bars": 8},
        {"section": "verse_1", "bars": 16},
        {"section": "chorus", "bars": 8},
        {"section": "verse_2", "bars": 16},
        {"section": "bridge", "bars": 8},
        {"section": "chorus", "bars": 8},
        {"section": "outro", "bars": 4},
    ])
    targets: dict = field(default_factory=lambda: {
        "duration_seconds": 180,
        "bpm": 90,
        "key": "F Minor",
        "time_signature": "4/4",
    })
    required_engines: list[str] = field(default_factory=lambda: [
        "mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export",
    ])


@dataclass
class TimelineEntry:
    section: str
    bar_start: int
    bar_end: int
    time_start_sec: float
    time_end_sec: float
    duration_sec: float
    transitions: dict = field(default_factory=dict)


@dataclass
class Timeline:
    entries: list[TimelineEntry] = field(default_factory=list)
    total_bars: int = 0
    total_duration_sec: float = 0.0


@dataclass
class Stem:
    id: str = ""
    type: str = ""          # kick, snare, hihat, bass, pad, lead, vox, fx
    file_path: str = ""
    sample_rate: int = 48000
    bit_depth: int = 24
    duration_sec: float = 0.0
    gain_db: float = 0.0
    pan: float = 0.0
    metadata: dict = field(default_factory=dict)


@dataclass
class MixSession:
    stems: list[Stem] = field(default_factory=list)
    master_gain_db: float = -1.0
    fx_chain: list[str] = field(default_factory=list)


@dataclass
class MasterSession:
    peak_db: float = 0.0
    lufs: float = -14.0
    true_peak_db: float = -1.0
    file_path: str = ""


@dataclass
class DnaRecord:
    sha256: str = ""
    tags: list[str] = field(default_factory=list)
    provenance: list[dict] = field(default_factory=list)


@dataclass
class LedgerRecord:
    entries: list[dict] = field(default_factory=list)
    total_usd: float = 0.0


@dataclass
class ExportAsset:
    format: str = "wav"
    file_path: str = ""
    size_bytes: int = 0
    checksum: str = ""


@dataclass
class EngineContext:
    job_id: str = ""
    prompt: str = ""
    style: str = "g_funk"
    creator_id: str = ""

    blueprint: Blueprint = field(default_factory=Blueprint)
    timeline: Timeline = field(default_factory=Timeline)
    arrangement: Any = field(default_factory=dict)  # TrackGraph (arrangement_engine)
    preset: Any = None  # Preset (preset_manager.py)
    emotion_bus: Any = None  # EmotionBus (emotion_bus.py)
    narrative_segments: list = field(default_factory=list)  # list[NarrativeSegment]
    musical_graph: Any = None  # MusicalGraph (harmony_engine.py)
    performance: Any = None  # PerformanceGraph (mma_engine.py)
    instrument_graph: Any = None  # InstrumentGraph (instrument_engine.py)
    render_manifest: Any = None  # RenderManifest (render_manifest.py)
    vocal_performance: Any = None  # VocalPerformance (pfa_engine.py)
    vocal_render_plan: Any = None  # VocalRenderPlan (voice_king_engine.py)
    dsp_graph: Any = None  # DSPGraph (pda_engine.py)
    mix_plan: Any = None  # MixPlan (mix_engine.py)
    master_plan: Any = None  # MasterPlan (master_engine.py)
    dna_provenance: Any = None  # DNAProvenance (dna_engine.py)
    ledger_plan: Any = None  # LedgerPlan (ledger_engine.py)
    export_plan: Any = None  # ExportPlan (export_engine.py)
    lyrics: str = ""
    stems: list[Stem] = field(default_factory=list)
    mix: MixSession = field(default_factory=MixSession)
    master: MasterSession = field(default_factory=MasterSession)
    dna: DnaRecord = field(default_factory=DnaRecord)
    ledger: LedgerRecord = field(default_factory=LedgerRecord)
    exports: list[ExportAsset] = field(default_factory=list)
