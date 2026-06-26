"""Sonic Forge — sovereign audio production core for Lyrica 3 Pro."""

from .context import (
    EngineContext,
    Blueprint,
    Timeline,
    TimelineEntry,
    Stem,
    MixSession,
    MasterSession,
    DnaRecord,
    LedgerRecord,
    ExportAsset,
)
from .orchestrator import SonicForgeOrchestrator, PipelineStage, enable_snapshots
from .engine_registry import BaseEngine, register_engine, get_engine, ENGINE_REGISTRY
from .blueprint_engine import BlueprintEngine
from .timeline_engine import TimelineEngine
from .arrangement_engine import ArrangementEngine, Track, TrackGraph, EnergySegment
from .persona_registry import Persona, get_persona, PERSONAS
from .emotion_bus import EmotionBus, SectionEmotion
from .narrative_engine import NarrativeEngine, NarrativeSegment, NarrativeProvider, TemplateProvider, set_narrative_provider
from .preset_manager import Preset, load_preset, PRESETS
from .harmony_engine import (
    HarmonyEngine,
    MusicalGraph,
    SectionChord,
    CadencePoint,
    BasslineTarget,
    TensionPoint,
    Motif,
    CountermelodyRegion,
)
from .performance_graph import PerformanceGraph, RhythmSection, PerformanceEvent
from .mma_engine import MMAEngine
from .ghostwriter_provider import GhostwriterProvider
from .instrument_graph import (
    InstrumentGraph,
    InstrumentTrack,
    MidiEvent,
    AutomationPoint,
    InstrumentBuilder,
    INSTRUMENT_BUILDERS,
    register_instrument,
)
from .instrument_builders import (
    DrumBuilder,
    BassBuilder,
    PadBuilder,
    KeysBuilder,
    LeadBuilder,
    StringsBuilder,
    FXBuilder,
    AutomationBuilder,
)
from .instrument_engine import InstrumentEngine
from .render_manifest import RenderManifest, build_render_manifest
from .music_utils import chord_to_midi_notes, note_name_to_midi, midi_to_note_name
from .vocal_performance import VocalPerformance, VocalPhrase, VocalNote
from .pfa_engine import PFAEngine
from .voice_king_engine import VoiceKingEngine, VocalRenderPlan, VocalRenderSegment
from .pda_engine import PDAEngine, DSPGraph, DSPTrack, DSPUnit, DSPParameter
from .mix_engine import MixEngine, MixPlan, MixBus
from .master_engine import MasterEngine, MasterPlan
from .dna_engine import DNAEngine, DNAProvenance, DNAAsset, DNATag
from .ledger_engine import LedgerEngine, LedgerPlan, LedgerEntry
from .export_engine import ExportEngine, ExportPlan, ExportFile


def create_default_pipeline() -> SonicForgeOrchestrator:
    """Register all stages in pipeline order (Blueprint → Export)."""
    SonicForgeOrchestrator.reset()
    SonicForgeOrchestrator.register(BlueprintEngine())
    SonicForgeOrchestrator.register(TimelineEngine())
    SonicForgeOrchestrator.register(ArrangementEngine())
    SonicForgeOrchestrator.register(NarrativeEngine())
    SonicForgeOrchestrator.register(HarmonyEngine())
    SonicForgeOrchestrator.register(MMAEngine())
    SonicForgeOrchestrator.register(InstrumentEngine())
    SonicForgeOrchestrator.register(PFAEngine())
    SonicForgeOrchestrator.register(VoiceKingEngine())
    SonicForgeOrchestrator.register(PDAEngine())
    SonicForgeOrchestrator.register(MixEngine())
    SonicForgeOrchestrator.register(MasterEngine())
    SonicForgeOrchestrator.register(DNAEngine())
    SonicForgeOrchestrator.register(LedgerEngine())
    SonicForgeOrchestrator.register(ExportEngine())
    return SonicForgeOrchestrator


__all__ = [
    "EngineContext",
    "Blueprint",
    "Timeline",
    "TimelineEntry",
    "Stem",
    "MixSession",
    "MasterSession",
    "DnaRecord",
    "LedgerRecord",
    "ExportAsset",
    "SonicForgeOrchestrator",
    "PipelineStage",
    "enable_snapshots",
    "BaseEngine",
    "register_engine",
    "get_engine",
    "ENGINE_REGISTRY",
    "BlueprintEngine",
    "TimelineEngine",
    "ArrangementEngine",
    "Track",
    "TrackGraph",
    "EnergySegment",
    "Persona",
    "get_persona",
    "PERSONAS",
    "EmotionBus",
    "SectionEmotion",
    "NarrativeEngine",
    "NarrativeSegment",
    "NarrativeProvider",
    "TemplateProvider",
    "set_narrative_provider",
    "Preset",
    "load_preset",
    "PRESETS",
    "HarmonyEngine",
    "MusicalGraph",
    "SectionChord",
    "CadencePoint",
    "BasslineTarget",
    "TensionPoint",
    "Motif",
    "CountermelodyRegion",
    "PerformanceGraph",
    "RhythmSection",
    "PerformanceEvent",
    "MMAEngine",
    "GhostwriterProvider",
    "InstrumentGraph",
    "InstrumentTrack",
    "MidiEvent",
    "AutomationPoint",
    "InstrumentBuilder",
    "INSTRUMENT_BUILDERS",
    "register_instrument",
    "DrumBuilder",
    "BassBuilder",
    "PadBuilder",
    "KeysBuilder",
    "LeadBuilder",
    "StringsBuilder",
    "FXBuilder",
    "AutomationBuilder",
    "InstrumentEngine",
    "RenderManifest",
    "build_render_manifest",
    "chord_to_midi_notes",
    "note_name_to_midi",
    "midi_to_note_name",
    "VocalPerformance",
    "VocalPhrase",
    "VocalNote",
    "PFAEngine",
    "VoiceKingEngine",
    "VocalRenderPlan",
    "VocalRenderSegment",
    "PDAEngine",
    "DSPGraph",
    "DSPTrack",
    "DSPUnit",
    "DSPParameter",
    "MixEngine",
    "MixPlan",
    "MixBus",
    "MasterEngine",
    "MasterPlan",
    "DNAEngine",
    "DNAProvenance",
    "DNAAsset",
    "DNATag",
    "LedgerEngine",
    "LedgerPlan",
    "LedgerEntry",
    "ExportEngine",
    "ExportPlan",
    "ExportFile",
    "create_default_pipeline",
]
