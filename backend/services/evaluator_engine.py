from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json
import asyncio
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

load_dotenv()


class Criterion(BaseModel):
    name: str
    score: int
    weight: float
    rationale: str


class EvaluationResult(BaseModel):
    subject: str
    criteria: List[Criterion]
    weighted_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    go_no_go: str
    quality_score: Optional[float] = None
    reasoning: Optional[str] = None
    recommendations: Optional[List[str]] = None


class EvalResult(BaseModel):
    quality_score: float
    reasoning: str
    recommendations: List[str]


class EvaluatorEngine:
    MODEL_CONFIG = {
        "gpt-4o-mini": ("openai", "gpt-4o-mini"),
        "mistral": ("mistral", "mistral-latest"),
        "gemini-1.5-pro": ("google", "gemini-1.5-pro"),
        "claude-3.5-sonnet": ("anthropic", "claude-3-5-sonnet-20241022"),
    }

    DEFAULT_MODEL = "claude-3.5-sonnet"

    CRITERIA_PRESETS = {
        "strategy": [
            {"name": "Clarity", "weight": 0.15, "description": "How clear and understandable is the strategy?"},
            {"name": "Feasibility", "weight": 0.20, "description": "How realistic is execution?"},
            {"name": "Impact Potential", "weight": 0.20, "description": "What's the potential upside?"},
            {"name": "Risk Level", "weight": 0.15, "description": "How manageable are the risks?"},
            {"name": "Resource Efficiency", "weight": 0.15, "description": "How well does it use available resources?"},
            {"name": "Differentiation", "weight": 0.15, "description": "How unique is the approach?"},
        ],
        "idea": [
            {"name": "Originality", "weight": 0.20, "description": "How novel is the idea?"},
            {"name": "Market Fit", "weight": 0.25, "description": "Does it solve a real problem?"},
            {"name": "Scalability", "weight": 0.20, "description": "Can it grow?"},
            {"name": "Execution Complexity", "weight": 0.15, "description": "How hard to build?"},
            {"name": "Competitive Advantage", "weight": 0.20, "description": "What's the moat?"},
        ],
        "plan": [
            {"name": "Completeness", "weight": 0.20, "description": "Are all steps covered?"},
            {"name": "Timeline Realism", "weight": 0.20, "description": "Are timelines achievable?"},
            {"name": "Resource Allocation", "weight": 0.15, "description": "Are resources properly assigned?"},
            {"name": "Risk Mitigation", "weight": 0.15, "description": "Are risks addressed?"},
            {"name": "Dependency Management", "weight": 0.15, "description": "Are dependencies clear?"},
            {"name": "Success Metrics", "weight": 0.15, "description": "Are outcomes measurable?"},
        ],
        "offer": [
            {"name": "Value Proposition", "weight": 0.25, "description": "Is the value clear?"},
            {"name": "Price-Value Alignment", "weight": 0.20, "description": "Is pricing fair?"},
            {"name": "Target Fit", "weight": 0.20, "description": "Right audience?"},
            {"name": "Urgency/Scarcity", "weight": 0.15, "description": "Compelling to act now?"},
            {"name": "Trust Signals", "weight": 0.20, "description": "Credibility established?"},
        ],
        "emotional_resonance": [
            {"name": "Tone Accuracy", "weight": 0.25, "description": "Does the tone match the intended emotion?"},
            {"name": "Archetype Consistency", "weight": 0.20, "description": "Is the character archetype consistent?"},
            {"name": "Emotional Depth", "weight": 0.20, "description": "How emotionally rich is the output?"},
            {"name": "Reader Impact", "weight": 0.20, "description": "Will it resonate with the audience?"},
            {"name": "Authenticity", "weight": 0.15, "description": "Does it feel genuine?"},
        ],
    }

    SYSTEM_PROMPT = """You are the Evaluator Engine.
Score and evaluate outputs against defined criteria.

RULES:
1. Return valid JSON only — no markdown, no commentary.
2. Score each criterion 1-10 with concrete justification.
3. Calculate weighted_score as sum of (score * weight).
4. go_no_go: go (7.0+), revise (5.0-6.9), no_go (<5.0).
5. Be honest — don't inflate scores.

OUTPUT FORMAT (JSON ONLY):
{
  "subject": "What is being evaluated.",
  "criteria": [{"name": "...", "score": 1-10, "weight": 0.0-1.0, "rationale": "..."}],
  "weighted_score": 0.0,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvement_suggestions": ["..."],
  "go_no_go": "go | no_go | revise"
}"""

    # ── Pure functions (stateless, testable) ──

    @staticmethod
    def score_dimensions(candidate_output: str, quality_criteria: List[str]) -> Dict[str, int]:
        """
        Pure function: scores each quality dimension 1-10 based on heuristics.

        Uses text analysis heuristics — no LLM calls, no side effects.
        Each criterion is scored by pattern-matching against the output.
        """
        scores = {}
        output_lower = candidate_output.lower()
        word_count = len(candidate_output.split())
        sentence_count = max(candidate_output.count(".") + candidate_output.count("!") + candidate_output.count("?"), 1)

        for criterion in quality_criteria:
            c = criterion.lower()

            if "accuracy" in c or "correctness" in c:
                # Higher confidence for longer, detailed outputs
                base = min(word_count / 20, 8)
                scores[criterion] = max(1, min(10, round(base + 2)))

            elif "clarity" in c or "readability" in c:
                avg_sentence_len = word_count / sentence_count
                if 10 <= avg_sentence_len <= 25:
                    scores[criterion] = 8
                elif avg_sentence_len < 5 or avg_sentence_len > 50:
                    scores[criterion] = 4
                else:
                    scores[criterion] = 6

            elif "tone" in c or "emotion" in c or "resonance" in c:
                emotional_words = [
                    "feel", "hope", "fear", "love", "hate", "joy", "sad", "angry",
                    "excited", "wonder", "dream", "heart", "soul", "passion",
                ]
                matches = sum(1 for w in emotional_words if w in output_lower)
                scores[criterion] = max(1, min(10, matches + 5))

            elif "consistency" in c or "coherence" in c:
                # Check for repeated terms indicating thematic consistency
                words = output_lower.split()
                unique_ratio = len(set(words)) / max(len(words), 1)
                if unique_ratio > 0.6:
                    scores[criterion] = 8
                elif unique_ratio > 0.4:
                    scores[criterion] = 6
                else:
                    scores[criterion] = 4

            elif "feasibility" in c or "realistic" in c:
                specifics = sum(1 for w in ["step", "timeline", "cost", "resource", "milestone"] if w in output_lower)
                scores[criterion] = max(1, min(10, specifics + 5))

            elif "impact" in c or "value" in c:
                impact_words = ["result", "outcome", "benefit", "growth", "increase", "improve", "transform"]
                matches = sum(1 for w in impact_words if w in output_lower)
                scores[criterion] = max(1, min(10, matches + 4))

            elif "completeness" in c or "comprehensive" in c:
                sections = sum(1 for marker in ["1.", "2.", "3.", "first", "second", "third", "finally"] if marker in output_lower)
                scores[criterion] = max(1, min(10, sections + 4))

            else:
                scores[criterion] = 6

        return scores

    @staticmethod
    def aggregate_scores(scores: Dict[str, int], weights: Dict[str, float]) -> EvalResult:
        """
        Pure function: aggregates dimension scores into a final weighted score.

        Args:
            scores: Dict of {criterion_name: score} (1-10 scale)
            weights: Dict of {criterion_name: weight} (sum should be 1.0)

        Returns:
            EvalResult with quality_score, reasoning, and recommendations
        """
        if not scores:
            return EvalResult(quality_score=0.0, reasoning="No scores provided", recommendations=["Define quality criteria before scoring"])

        total_weight = 0.0
        weighted_sum = 0.0
        used_criteria = []

        for criterion, score in scores.items():
            weight = weights.get(criterion, 1.0 / max(len(scores), 1))
            weighted_sum += score * weight
            total_weight += weight
            used_criteria.append({"name": criterion, "score": score, "weight": weight})

        if total_weight == 0:
            return EvalResult(quality_score=0.0, reasoning="Total weight is zero", recommendations=["Assign non-zero weights to criteria"])

        quality_score = round(weighted_sum / total_weight, 2)

        low_scores = [c["name"] for c in used_criteria if c["score"] < 5]
        high_scores = [c["name"] for c in used_criteria if c["score"] >= 8]

        parts = []
        if high_scores:
            parts.append(f"Strong in: {', '.join(high_scores)}")
        if low_scores:
            parts.append(f"Needs improvement in: {', '.join(low_scores)}")
        parts.append(f"Weighted score: {quality_score}/10")

        recommendations = []
        if low_scores:
            for c in low_scores:
                recommendations.append(f"Improve {c.lower()} with targeted revisions")
        if quality_score < 5.0:
            recommendations.append("Major revision recommended before proceeding")
        elif quality_score < 7.0:
            recommendations.append("Minor revisions recommended for better quality")
        else:
            recommendations.append("Quality meets or exceeds threshold — proceed")

        reasoning = " | ".join(parts)

        return EvalResult(
            quality_score=quality_score,
            reasoning=reasoning,
            recommendations=recommendations,
        )

    # ── LLM-based evaluation ──

    @classmethod
    def _get_api_key(cls) -> str:
        return os.environ.get("EMERGENT_LLM_KEY")

    @classmethod
    def _create_chat(cls, model: Optional[str] = None) -> LlmChat:
        model = model or cls.DEFAULT_MODEL
        api_key = cls._get_api_key()
        provider, model_name = cls.MODEL_CONFIG.get(model, cls.MODEL_CONFIG[cls.DEFAULT_MODEL])
        return LlmChat(
            api_key=api_key,
            session_id=f"evaluator-{model}",
            system_message=cls.SYSTEM_PROMPT,
        ).with_model(provider, model_name)

    @classmethod
    def evaluate(
        cls,
        candidate_output: str,
        quality_criteria: Optional[List[str]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> EvalResult:
        """
        Primary entry point: pure-function evaluation.
        Scores output against quality dimensions and aggregates them.
        No LLM calls — uses heuristic scoring.
        """
        criteria = quality_criteria or ["Accuracy", "Clarity", "Completeness"]
        weights = weights or {c: 1.0 / len(criteria) for c in criteria}

        scores = cls.score_dimensions(candidate_output, criteria)
        return cls.aggregate_scores(scores, weights)

    @classmethod
    async def evaluate_async(
        cls,
        subject: str,
        content: str,
        criteria: Optional[List[dict]] = None,
        criteria_preset: Optional[str] = None,
        context: Optional[str] = None,
        model: Optional[str] = None,
    ) -> dict:
        chat = cls._create_chat(model)

        if criteria:
            criteria_text = json.dumps(criteria, indent=2)
        elif criteria_preset and criteria_preset in cls.CRITERIA_PRESETS:
            criteria_text = json.dumps(cls.CRITERIA_PRESETS[criteria_preset], indent=2)
        else:
            criteria_text = "Use appropriate criteria for the subject type."

        prompt_parts = [
            f"Evaluate the following:",
            f"Subject: {subject}",
            f"Content: {content}",
            f"\nEvaluation Criteria:\n{criteria_text}",
        ]

        if context:
            prompt_parts.append(f"\nAdditional Context: {context}")

        prompt = "\n".join(prompt_parts)

        message = UserMessage(text=prompt)
        response = await chat.send_message(message)

        try:
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                response = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                response = response[start:end].strip()

            result = json.loads(response)

            if "criteria" in result:
                weighted_sum = sum(
                    c.get("score", 0) * c.get("weight", 0)
                    for c in result["criteria"]
                )
                result["weighted_score"] = round(weighted_sum, 2)

                if result["weighted_score"] >= 7.0:
                    result["go_no_go"] = "go"
                elif result["weighted_score"] >= 5.0:
                    result["go_no_go"] = "revise"
                else:
                    result["go_no_go"] = "no_go"

            return result
        except json.JSONDecodeError:
            return {
                "subject": subject,
                "criteria": [],
                "weighted_score": 0.0,
                "strengths": ["Unable to parse evaluation"],
                "weaknesses": ["Response format error"],
                "improvement_suggestions": ["Retry with clearer content"],
                "go_no_go": "revise",
            }

    @classmethod
    def evaluate_sync(
        cls,
        subject: str,
        content: str,
        criteria: Optional[List[dict]] = None,
        criteria_preset: Optional[str] = None,
        context: Optional[str] = None,
        model: Optional[str] = None,
    ) -> dict:
        return asyncio.run(cls.evaluate_async(subject, content, criteria, criteria_preset, context, model))

    @classmethod
    async def evaluate_strategy_async(cls, strategy: dict) -> dict:
        return await cls.evaluate_async(
            subject="Strategy Evaluation",
            content=json.dumps(strategy, indent=2),
            criteria_preset="strategy",
        )

    @classmethod
    async def evaluate_plan_async(cls, plan: dict) -> dict:
        return await cls.evaluate_async(
            subject="Execution Plan Evaluation",
            content=json.dumps(plan, indent=2),
            criteria_preset="plan",
        )

    @classmethod
    async def evaluate_idea_async(cls, idea: str, context: Optional[str] = None) -> dict:
        return await cls.evaluate_async(
            subject="Idea Evaluation",
            content=idea,
            criteria_preset="idea",
            context=context,
        )

    @classmethod
    async def evaluate_offer_async(cls, offer: str, target_audience: Optional[str] = None) -> dict:
        ctx = f"Target audience: {target_audience}" if target_audience else None
        return await cls.evaluate_async(
            subject="Offer Evaluation",
            content=offer,
            criteria_preset="offer",
            context=ctx,
        )

    @classmethod
    async def compare_async(
        cls,
        options: List[dict],
        criteria: Optional[List[dict]] = None,
        criteria_preset: Optional[str] = None,
    ) -> dict:
        evaluations = []
        for option in options:
            eval_result = await cls.evaluate_async(
                subject=option.get("name", "Option"),
                content=option.get("content", ""),
                criteria=criteria,
                criteria_preset=criteria_preset,
            )
            evaluations.append({
                "name": option.get("name"),
                "weighted_score": eval_result.get("weighted_score", 0),
                "go_no_go": eval_result.get("go_no_go", "revise"),
                "evaluation": eval_result,
            })

        evaluations.sort(key=lambda x: x["weighted_score"], reverse=True)

        return {
            "comparison_type": criteria_preset or "custom",
            "rankings": [
                {"rank": i + 1, "name": e["name"], "score": e["weighted_score"], "decision": e["go_no_go"]}
                for i, e in enumerate(evaluations)
            ],
            "winner": evaluations[0]["name"] if evaluations else None,
            "detailed_evaluations": evaluations,
        }

    @classmethod
    def get_available_presets(cls) -> dict:
        return {
            preset: [c["name"] for c in criteria]
            for preset, criteria in cls.CRITERIA_PRESETS.items()
        }
