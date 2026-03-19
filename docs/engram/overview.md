# Engram — Immune System for AI Agents

## The Problem No One Is Solving

As AI agents become more capable, they make decisions faster — and become more vulnerable to what they *don't see*. An agent that finds a stale file via grep will confidently build on it, never knowing a newer replacement exists two directories away. The file was never in its search results. **What isn't visible doesn't exist.**

The industry's response is to make models bigger, contexts longer, training better. All of these improve the *brain*. None of them address a structural gap: **no one is watching what the agent fails to look at**.

Biological organisms don't survive on brains alone. The immune system, endocrine system, and autonomic nervous system protect the body independently of conscious thought. AI agents have nothing equivalent.

Engram is that missing infrastructure.

## Architecture

Engram operates as a sidecar to the AI agent, observing its behavior stream without interfering with its work.

```
Agent (Claude Code, etc.)
  │
  │  tool calls: Read, Edit, Grep, Bash, ...
  │
  ▼
Receptor Layer (passive observation)
  ├── Normalizer     — framework-agnostic event translation
  ├── Commander      — time-window behavioral analysis
  ├── PathHeatmap    — multi-index file access tracking
  ├── Emotion Engine — 5-axis emotion vector computation
  ├── Neuron Triangle — A/B/C three-layer firing model
  └── Shadow Index   — pre-neuron staleness detection
        │
        ▼
  Interpretation Layer (passive receptor)
  ├── receptor-rules.json — declarative method definitions
  ├── Scoring engine      — signal × state × intensity × learnedDelta
  └── Output Router       — hotmemo / engram / file / silent
```

### Key Design Principles

1. **No LLM inference in the monitoring path** — Pure signal processing. Heatmaps, decay functions, threshold comparisons. The agent's own intelligence is not consumed.

2. **The agent doesn't know it's being watched** — Receptor observes tool call hooks. The agent works normally. Signals surface only when genuinely needed.

3. **Separation of detection and interpretation** — The emotion engine fires signals. What to *do* about those signals is decided by a separate interpretation layer with declarative rules.

4. **Field coupling, not direct control** — The Meta neuron (C layer) adjusts the Emotion Engine's thresholds by emitting fields, not by issuing commands. Each layer is autonomous. This mirrors biological neuromodulation.

5. **Time decay as the universal weight** — No arbitrary coefficients. Exponential decay with configurable half-lives. Fairness through physics.

## Subsystems

### Receptor — Behavioral Observation

The receptor layer translates raw tool calls into normalized events, tracks behavioral patterns across time windows, and computes a 5-axis emotion vector (frustration, seeking, confidence, fatigue, flow).

A three-layer neuron model governs signal firing:
- **A (Flow Gate)**: Hard neuron. When the agent is in flow, all interventions are suppressed. Inviolable.
- **B (Emotion Engine)**: Soft neurons. Dynamic thresholds adapt to the agent's baseline behavior via EMA.
- **C (Meta Neuron)**: Observes B's firing patterns and adjusts B's thresholds through field emission. Never fires directly.

→ [Receptor Architecture](./receptor-architecture)

### Shadow Index — Pre-Neuron Staleness Detection

The Shadow Index extends the PathHeatmap with a 6-axis HeatNode (access count, opened, modified, lastModified, lastAccess, lastTouchedState) and a 3-stage staleness detector that expands its search scope progressively: siblings → ancestors → cross-directory filename index.

It operates as a **pre-neuron monitor** — detecting states that would never trigger the neuron system because the neuron's inputs don't contain the missing information. This is the fundamental reason it exists as an independent layer.

→ [Shadow Index](./shadow-index)

### Predictive Inference — Future Probe

Where Shadow Index validates the *premises* of the agent's actions (are you looking at the right files?), the Future Probe validates the *consequences* (will this action lead where you think?).

Together they form a temporal safety net: one looks backward, the other forward.

→ [Predictive Inference](./predictive-inference)

### Behavioral Prior — Body Memory

Engram provides *information* continuity across sessions. Behavioral Prior provides *behavioral* continuity — adapted thresholds, pattern distributions, emotion baselines.

If engram is declarative memory (hippocampus), behavioral prior is procedural memory (cerebellum/basal ganglia). The Persona system extends this to species-level collective experience via the Sphere network.

## Why the Industry Won't Build This

The cost-benefit math doesn't work yet. When an agent wastes 10 minutes on a stale file but still produces correct code, the output value exceeds the waste. "AI sometimes goes off track" is accepted as a limitation.

The real cost appears at scale. When autonomous agents traverse dozens of files with stale premises, correction costs grow nonlinearly. The agent believes it's succeeding — tests pass, types check, only the premises are wrong.

Framing this as "AI limitations" is the most dangerous outcome. It's not a limitation of the model. It's an **architectural absence** — missing monitoring infrastructure. The next model won't fix it. A 10x context window still can't see files that weren't in the search results.

Biology paid the cost of an immune system. Evolution kept it because organisms without one were eliminated by threats the brain couldn't perceive. When AI agents begin autonomously affecting production systems, the cost of unseen mistakes will justify this infrastructure. Until then, we build ahead.