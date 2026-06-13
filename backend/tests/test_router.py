"""
Unit tests for RoutingEngine — pure functions, no server needed.
"""
import pytest
from services.router import RoutingEngine, ComplexityLevel


class TestRoutingClassification:
    """Test the _classify static method."""

    @pytest.mark.parametrize("prompt,expected", [
        ("what is the capital of France", ComplexityLevel.SIMPLE),
        ("define recursion in programming", ComplexityLevel.SIMPLE),
        ("list all files in the directory", ComplexityLevel.SIMPLE),
        ("extract the email addresses from this text", ComplexityLevel.SIMPLE),
        ("translate hello to Spanish", ComplexityLevel.SIMPLE),
        ("convert Celsius to Fahrenheit", ComplexityLevel.SIMPLE),
        ("summarize this article in 3 sentences", ComplexityLevel.SIMPLE),
        ("find all images in the folder", ComplexityLevel.SIMPLE),
        ("search for python tutorials", ComplexityLevel.SIMPLE),
        ("lookup the definition of photosynthesis", ComplexityLevel.SIMPLE),
    ])
    def test_classify_simple(self, prompt, expected):
        result = RoutingEngine._classify(prompt)
        assert result == expected, f"Expected {expected.value}, got {result.value} for: {prompt}"

    @pytest.mark.parametrize("prompt,expected", [
        ("draft a business proposal for a SaaS product", ComplexityLevel.MEDIUM),
        ("write a blog post about AI ethics", ComplexityLevel.MEDIUM),
        ("compose an email to investors", ComplexityLevel.MEDIUM),
        ("research the competitive landscape for edtech", ComplexityLevel.MEDIUM),
        ("explain how neural networks work", ComplexityLevel.MEDIUM),
        ("describe the architecture of a microservices system", ComplexityLevel.MEDIUM),
        ("outline a marketing strategy for Q3", ComplexityLevel.MEDIUM),
        ("generate a product roadmap", ComplexityLevel.MEDIUM),
        ("create a content calendar", ComplexityLevel.MEDIUM),
        ("plan a software migration project", ComplexityLevel.MEDIUM),
    ])
    def test_classify_medium(self, prompt, expected):
        result = RoutingEngine._classify(prompt)
        assert result == expected, f"Expected {expected.value}, got {result.value} for: {prompt}"

    @pytest.mark.parametrize("prompt,expected", [
        ("reason through the implications of quantum decoherence", ComplexityLevel.COMPLEX),
        ("complex reasoning about philosophical nuance", ComplexityLevel.COMPLEX),
        ("deep dive into the ethical considerations of AGI", ComplexityLevel.COMPLEX),
        ("creative writing with intricate character development", ComplexityLevel.COMPLEX),
        ("argue both sides of the nature vs nurture debate", ComplexityLevel.COMPLEX),
        ("critique the epistemological foundations of empiricism", ComplexityLevel.COMPLEX),
        ("synthesize multiple perspectives on climate policy", ComplexityLevel.COMPLEX),
        ("integrate findings from neuroscience and psychology", ComplexityLevel.COMPLEX),
    ])
    def test_classify_complex(self, prompt, expected):
        result = RoutingEngine._classify(prompt)
        assert result == expected, f"Expected {expected.value}, got {result.value} for: {prompt}"

    def test_classify_complex_overrides_medium(self):
        """When complex keywords appear >= 2 times, complex overrides."""
        prompt = "complex reasoning about ethical dilemmas in philosophy"
        result = RoutingEngine._classify(prompt)
        assert result == ComplexityLevel.COMPLEX

    def test_classify_general_fallback(self):
        """Prompts with no matching keywords fall back to GENERAL."""
        result = RoutingEngine._classify("hello world")
        assert result == ComplexityLevel.GENERAL

    def test_classify_empty_string(self):
        result = RoutingEngine._classify("")
        assert result == ComplexityLevel.GENERAL


class TestRoutingRoute:
    """Test the route classmethod."""

    def test_route_returns_routing_decision(self):
        decision = RoutingEngine.route("what is the weather")
        assert decision.model is not None
        assert decision.reason is not None
        assert decision.complexity is not None
        assert isinstance(decision.fallback_chain, list)

    def test_route_simple_returns_gpt4o_mini(self):
        decision = RoutingEngine.route("list all users")
        assert decision.model == "gpt-4o-mini"

    def test_route_medium_returns_gemini(self):
        decision = RoutingEngine.route("draft a marketing plan")
        assert decision.model == "gemini-1.5-pro"

    def test_route_complex_returns_claude(self):
        decision = RoutingEngine.route("deep ethical analysis of autonomous weapons")
        assert decision.model == "claude-3.5-sonnet"

    def test_route_force_model_override(self):
        decision = RoutingEngine.route("what is the time", force_model="claude-3.5-sonnet")
        assert decision.model == "claude-3.5-sonnet"
        assert decision.complexity == "override"

    def test_route_force_model_fallback_chain(self):
        decision = RoutingEngine.route("hello", force_model="mistral")
        assert "gpt-4o-mini" in decision.fallback_chain
        assert "gemini-1.5-pro" in decision.fallback_chain


class TestRoutingFallbackChains:
    """Test fallback chains are well-formed."""

    def test_all_models_have_fallback(self):
        models = ["gpt-4o-mini", "mistral", "gemini-1.5-pro", "claude-3.5-sonnet"]
        for model in models:
            chain = RoutingEngine.FALLBACK_CHAINS.get(model)
            assert chain is not None, f"Missing fallback chain for {model}"
            assert len(chain) > 0, f"Empty fallback chain for {model}"
            assert model not in chain, f"Fallback chain for {model} contains itself"

    def test_fallback_chains_have_valid_models(self):
        valid_models = set(RoutingEngine.MODEL_POOL.keys())
        for model, chain in RoutingEngine.FALLBACK_CHAINS.items():
            for fallback in chain:
                assert fallback in valid_models, (
                    f"Invalid fallback model '{fallback}' in chain for '{model}'"
                )


class TestRoutingModelPool:
    """Test the model pool definition."""

    def test_available_models(self):
        models = RoutingEngine.get_available_models()
        assert isinstance(models, dict)
        assert "gpt-4o-mini" in models
        assert "mistral" in models
        assert "gemini-1.5-pro" in models
        assert "claude-3.5-sonnet" in models

    def test_model_pool_structure(self):
        for name, info in RoutingEngine.MODEL_POOL.items():
            assert "provider" in info, f"Missing provider for {name}"
            assert "strength" in info, f"Missing strength for {name}"
            assert "tier" in info, f"Missing tier for {name}"
