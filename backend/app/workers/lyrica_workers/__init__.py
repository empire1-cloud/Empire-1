"""Lyrica 3 Pro native workers (MMA, PFA, Demucs) — mirror of sl-universal lyrica_workers."""

from .mma_worker import MicroRhythmAgent
from .pfa_worker import PhonationFryAgent
from .demucs_worker import DemucsOrchestrator

__all__ = ["MicroRhythmAgent", "PhonationFryAgent", "DemucsOrchestrator"]
