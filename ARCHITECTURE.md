# Empire-1 Architecture

## 1. THE BRAIN (The LLM Routing & Logic Layers)

- **AURA (Ghostwriter)**: Runs the initial LangChain node. Analyzes user text, plans narrative arc, applies ethical guardrails (CEG).
- **ASE (Reward Core)**: Runs the evaluation node. Acts as the Discriminator, scoring AURA's output against Soulfire constraints (DO NOT drift, 30% departure).

## 2. THE LANGUAGE & CULTURE CORTEX (The Prompt Injection)

- **EFL Engine**: System Instruction Set injected into AURA. Forces the LLM to use Caló lexicon, Barrio prosody, and specific `[micro_pause]` formatting before output.

## 3. THE TOOLS (The API Callouts)

Google ADK agents use `@tool` decorators for physical actions:

- **DOPE (Audio Rendering)**: Fires JSON payload to external GPUs (MusicGen, RVC, HTDemucs) to render 48kHz stems.
- **SSS (Guardian/Mastering)**: Runs similarity scrubber on output, injects cryptographic watermark (SynthID) into .wav file.
- **Echo Weaver**: Translates AURA's metaphors into exact DSP integers (e.g., reverb tail = 4.5s).

## 4. THE RUNTIME (The Infrastructure)

- **EFAD (SoulPod)**: Google Cloud Run + Vertex AI Session Service. Ephemeral, containerized wrapper for isolated user generations.

## 5. THE BACKEND (The Law & Economy)

- **LedgerNet**: Generates Synapse_Event, sends DNA Tag and micro-royalty data to Empire-1 CockroachDB/Postgres database.
