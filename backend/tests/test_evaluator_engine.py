"""
Unit tests for EvaluatorEngine — pure functions, no server or LLM needed.
"""
import pytest
from services.evaluator_engine import EvaluatorEngine, EvalResult


class TestScoreDimensions:
    """Test the pure score_dimensions static method."""

    def test_accuracy_criterion_scored(self):
        scores = EvaluatorEngine.score_dimensions(
            "This is a detailed accuracy test with enough words for scoring.",
            ["Accuracy"],
        )
        assert "Accuracy" in scores
        assert 1 <= scores["Accuracy"] <= 10

    def test_clarity_criterion_short_sentences(self):
        text = "Hello world. How are you. I am fine. Let us go. See you later. This is great."
        scores = EvaluatorEngine.score_dimensions(text, ["Clarity"])
        assert "Clarity" in scores
        assert 1 <= scores["Clarity"] <= 10

    def test_tone_criterion_with_emotional_words(self):
        text = "I feel hope and love. This brings me joy. My heart is full of passion."
        scores = EvaluatorEngine.score_dimensions(text, ["Tone"])
        assert "Tone" in scores
        assert 1 <= scores["Tone"] <= 10

    def test_consistency_criterion(self):
        text = "theme theme theme theme theme theme theme theme"
        scores = EvaluatorEngine.score_dimensions(text, ["Consistency"])
        assert "Consistency" in scores
        assert 1 <= scores["Consistency"] <= 10

    def test_feasibility_criterion(self):
        text = "Step one: plan. Timeline: Q1. Cost: $10k. Resources: 3 people. Milestone: launch."
        scores = EvaluatorEngine.score_dimensions(text, ["Feasibility"])
        assert "Feasibility" in scores
        assert 1 <= scores["Feasibility"] <= 10

    def test_impact_criterion(self):
        text = "This result will drive growth and improve outcomes. Benefit measured in revenue."
        scores = EvaluatorEngine.score_dimensions(text, ["Impact"])
        assert "Impact" in scores
        assert 1 <= scores["Impact"] <= 10

    def test_completeness_criterion(self):
        text = "First, do this. Second, do that. Third, finish. Finally, review."
        scores = EvaluatorEngine.score_dimensions(text, ["Completeness"])
        assert "Completeness" in scores
        assert 1 <= scores["Completeness"] <= 10

    def test_unknown_criterion_defaults_to_6(self):
        scores = EvaluatorEngine.score_dimensions("some text", ["RandomMetric"])
        assert scores["RandomMetric"] == 6

    def test_multiple_criteria(self):
        scores = EvaluatorEngine.score_dimensions(
            "Analyze the result. The outcome shows growth. Step by step.",
            ["Accuracy", "Clarity", "Impact"],
        )
        assert len(scores) == 3

    def test_empty_string(self):
        scores = EvaluatorEngine.score_dimensions("", ["Clarity"])
        assert "Clarity" in scores

    def test_single_word_input(self):
        scores = EvaluatorEngine.score_dimensions("hello", ["Accuracy"])
        assert "Accuracy" in scores
        assert 1 <= scores["Accuracy"] <= 10


class TestAggregateScores:
    """Test the pure aggregate_scores static method."""

    def test_basic_aggregation(self):
        scores = {"Clarity": 8, "Accuracy": 7, "Impact": 9}
        weights = {"Clarity": 0.4, "Accuracy": 0.3, "Impact": 0.3}
        result = EvaluatorEngine.aggregate_scores(scores, weights)
        assert isinstance(result, EvalResult)
        expected = round((8 * 0.4 + 7 * 0.3 + 9 * 0.3) / 1.0, 2)
        assert result.quality_score == expected

    def test_equal_weights_when_not_provided(self):
        scores = {"Clarity": 8, "Accuracy": 7}
        result = EvaluatorEngine.aggregate_scores(scores, {})
        expected = round((8 * 0.5 + 7 * 0.5), 2)
        assert result.quality_score == expected

    def test_empty_scores(self):
        result = EvaluatorEngine.aggregate_scores({}, {})
        assert result.quality_score == 0.0
        assert "No scores provided" in result.reasoning

    def test_zero_total_weight(self):
        result = EvaluatorEngine.aggregate_scores({"Clarity": 8}, {"Clarity": 0.0})
        assert result.quality_score == 0.0
        assert "Total weight is zero" in result.reasoning

    def test_high_quality_proceed_recommendation(self):
        scores = {"Clarity": 9, "Accuracy": 8, "Completeness": 9}
        weights = {"Clarity": 0.33, "Accuracy": 0.33, "Completeness": 0.34}
        result = EvaluatorEngine.aggregate_scores(scores, weights)
        assert result.quality_score >= 7.0
        assert any("proceed" in r.lower() for r in result.recommendations)

    def test_low_quality_major_revision(self):
        scores = {"Clarity": 2, "Accuracy": 3}
        result = EvaluatorEngine.aggregate_scores(scores, {})
        assert result.quality_score < 5.0
        assert any("major revision" in r.lower() for r in result.recommendations)

    def test_mid_quality_minor_revision(self):
        scores = {"Clarity": 6, "Accuracy": 6}
        result = EvaluatorEngine.aggregate_scores(scores, {})
        assert 5.0 <= result.quality_score < 7.0
        assert any("minor revision" in r.lower() for r in result.recommendations)

    def test_low_scores_generate_improvement_recommendations(self):
        scores = {"Clarity": 3, "Accuracy": 8}
        result = EvaluatorEngine.aggregate_scores(scores, {})
        clarity_recs = [r for r in result.recommendations if "clarity" in r.lower()]
        assert len(clarity_recs) > 0


class TestEvaluatePure:
    """Test the evaluate classmethod (pure, no LLM)."""

    def test_evaluate_returns_eval_result(self):
        result = EvaluatorEngine.evaluate(
            "This is a test output with some decent content and reasonable structure.",
        )
        assert isinstance(result, EvalResult)
        assert 1.0 <= result.quality_score <= 10.0

    def test_evaluate_with_custom_criteria(self):
        result = EvaluatorEngine.evaluate(
            "Detailed analysis with step-by-step reasoning and clear conclusions.",
            quality_criteria=["Accuracy", "Clarity", "Impact", "Completeness"],
        )
        assert result.quality_score > 0

    def test_evaluate_with_custom_weights(self):
        result = EvaluatorEngine.evaluate(
            "Good content here with proper structure.",
            quality_criteria=["Accuracy", "Tone"],
            weights={"Accuracy": 0.8, "Tone": 0.2},
        )
        assert result.quality_score > 0
