from pydantic import BaseModel
import re
from enum import Enum
from typing import Optional, List


class ComplexityLevel(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    GENERAL = "general"


class RoutingDecision(BaseModel):
    model: str
    reason: str
    complexity: str
    fallback_chain: List[str]


class RoutingEngine:
    MODEL_POOL = {
        "gpt-4o-mini": {
            "provider": "openai",
            "strength": "fast, low cost, high throughput",
            "tier": "simple",
        },
        "mistral": {
            "provider": "mistral",
            "strength": "fast, low cost, high throughput",
            "tier": "simple",
        },
        "gemini-1.5-pro": {
            "provider": "google",
            "strength": "large context window, data integration",
            "tier": "medium",
        },
        "claude-3.5-sonnet": {
            "provider": "anthropic",
            "strength": "deep reasoning and creative nuance",
            "tier": "complex",
        },
    }

    PATTERNS = {
        ComplexityLevel.SIMPLE: [
            r"\bwhat is\b", r"\bdefine\b", r"\blist\b", r"\bextract\b",
            r"\btranslate\b", r"\bconvert\b", r"\bsummarize\b", r"\bquick\b",
            r"\bsimple\b", r"\bqa\b", r"\bquestion\b", r"\banswer\b",
            r"\bfind\b", r"\bsearch\b", r"\blookup\b",
        ],
        ComplexityLevel.MEDIUM: [
            r"\bdraft\b", r"\bwrite\b", r"\bcompose\b", r"\bresearch\b",
            r"\bexplain\b", r"\bdescribe\b", r"\boutline\b", r"\bgenerate\b",
            r"\bcreate\b", r"\bplan\b", r"\bstrategy\b", r"\banalyze\b",
            r"\breview\b", r"\bsummarize.*document\b",
        ],
        ComplexityLevel.COMPLEX: [
            r"\breason\b", r"\bnuan[ck]e\b", r"\bdepth\b", r"\bcreative\b",
            r"\bcomplex\b", r"\bdifficult\b", r"\bintricate\b", r"\bphilosophical\b",
            r"\bethical\b", r"\bargue\b", r"\bdebate\b", r"\bcritique\b",
            r"\bsynthesize\b", r"\bintegrate\b", r"\btheorem\b", r"\bproof\b",
        ],
    }

    COMPLEXITY_MODEL_MAP = {
        ComplexityLevel.SIMPLE: "gpt-4o-mini",
        ComplexityLevel.MEDIUM: "gemini-1.5-pro",
        ComplexityLevel.COMPLEX: "claude-3.5-sonnet",
        ComplexityLevel.GENERAL: "gemini-1.5-pro",
    }

    FALLBACK_CHAINS = {
        "gpt-4o-mini": ["mistral", "gemini-1.5-pro", "claude-3.5-sonnet"],
        "mistral": ["gpt-4o-mini", "gemini-1.5-pro", "claude-3.5-sonnet"],
        "gemini-1.5-pro": ["claude-3.5-sonnet", "gpt-4o-mini"],
        "claude-3.5-sonnet": ["gemini-1.5-pro", "gpt-4o-mini"],
    }

    COMPLEXITY_REASONS = {
        ComplexityLevel.SIMPLE: "Simple Q&A/extraction task — routed to fast, low-cost model",
        ComplexityLevel.MEDIUM: "Medium-complexity drafting/research task — routed to Gemini 1.5 Pro for large context",
        ComplexityLevel.COMPLEX: "Complex reasoning/nuance task — routed to Claude 3.5 Sonnet for deep reasoning",
        ComplexityLevel.GENERAL: "General task — routed to Gemini 1.5 Pro as default",
    }

    @classmethod
    def _compile_patterns(cls):
        return {
            level: [re.compile(p, re.IGNORECASE) for p in patterns]
            for level, patterns in cls.PATTERNS.items()
        }

    @classmethod
    def _classify(cls, prompt: str) -> ComplexityLevel:
        compiled = cls._compile_patterns()
        scores = {level: 0 for level in ComplexityLevel}

        for level, patterns in compiled.items():
            for pattern in patterns:
                if pattern.search(prompt):
                    scores[level] += 1

        # Complex match overrides if confidence is high
        if scores[ComplexityLevel.COMPLEX] >= 2:
            return ComplexityLevel.COMPLEX

        max_level = max(scores, key=scores.get)

        if scores[max_level] == 0:
            return ComplexityLevel.GENERAL

        return max_level

    @classmethod
    def route(cls, goal: str, force_model: Optional[str] = None) -> RoutingDecision:
        if force_model:
            fallback = cls.FALLBACK_CHAINS.get(force_model, ["gpt-4o-mini"])
            return RoutingDecision(
                model=force_model,
                reason=f"Model override specified — using {force_model}",
                complexity="override",
                fallback_chain=fallback,
            )

        complexity = cls._classify(goal)
        model = cls.COMPLEXITY_MODEL_MAP[complexity]
        reason = cls.COMPLEXITY_REASONS[complexity]
        fallback = cls.FALLBACK_CHAINS.get(model, ["gpt-4o-mini"])

        return RoutingDecision(
            model=model,
            reason=reason,
            complexity=complexity.value,
            fallback_chain=fallback,
        )

    @classmethod
    def get_available_models(cls) -> dict:
        return cls.MODEL_POOL
