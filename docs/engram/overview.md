# Engram — Immune System for AI Agents

## What Engram Is

Engram is cross-session memory and behavioral intelligence for AI agents. It provides three things no other system offers together:

1. **Metabolic knowledge persistence** — Knowledge that is used survives. Knowledge that isn't, dies.
2. **Real-time behavior monitoring** — A passive sensory layer that watches what the agent does without consuming LLM inference.
3. **Predictive knowledge supply** — The system anticipates what the agent will need before it asks.

No external APIs. No LLM token cost. Fully local. Two Docker containers.

> Born from the [Sphere](https://github.com/hiatamaworkshop) project's philosophy: information has its own ecology.

## Architecture

```
┌───────────────────────────────────────────────────┐
│  AI Agent (Claude Code / any MCP client)           │
│    pull · push · flag · ls · status · watch        │
└──────────────────┬────────────────────────────────┘
                   │ MCP (stdio)
┌──────────────────▼────────────────────────────────┐
│  MCP Server                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  5 tools │  │ Hot Memo │  │    Receptor       │ │
│  │  + watch │  │ (session │  │ (behavior signal  │ │
│  │          │  │  context)│  │  pipeline)        │ │
│  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────┬────────────────────────────────┘
                   │ HTTP
┌──────────────────▼────────────────────────────────┐
│  Gateway                              Docker :3100 │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐  │
│  │   Gate   │  │ Embedding │  │   Digestor     │  │
│  │(validate)│  │(MiniLM-L6)│  │ (10min batch)  │  │
│  └──────────┘  └───────────┘  └────────────────┘  │
└──────────────────┬────────────────────────────────┘
                   │ REST
┌──────────────────▼────────────────────────────────┐
│  Qdrant                               Docker :6333 │
│  Vector search + payload storage + persistence     │
└───────────────────────────────────────────────────┘
```

## Core: Metabolic Knowledge

### The Problem with Accumulation

Every other memory system for AI agents is an accumulator. Push knowledge in, search it later, never delete. The store grows until it's too noisy to be useful.

Engram takes the opposite approach: **forgetting is the feature**. Nodes have a lifecycle. Unused knowledge decays and dies. Frequently recalled knowledge is promoted and persists. The system metabolizes information the same way biological organisms metabolize nutrients — extract value, discard waste.

### Node Lifecycle

```
engram_push → [recent, weight:0, TTL:6h]
                    │
        ┌───────────┼───────────┐
   recall hit    no recall   engram_flag
   weight +0.35  TTL decays   weight -2/-3
        │           │           │
        ▼           ▼           ▼
   [promoted]    [expired]   [demoted]
   → fixed       deleted     → recent
   (permanent)
```

- **Promotion**: weight ≥ 3 AND hitCount ≥ 5 → `fixed` (permanent)
- **Expiry**: TTL ≤ 0 AND weight ≤ 0 → deleted
- **Demotion**: `fixed` + negative flag → back to `recent`

The Digestor runs every 10 minutes: decay weights, tick TTL, promote, expire. Fixed nodes are untouched. Inactive projects hibernate (TTL frozen — knowledge doesn't rot while you're away).

### Sanitize Layer

On ingestion, a multi-phase pipeline runs without any LLM call:

1. **Gate** — Format validation (summary length, tag count, weight range)
2. **Granularity** — Reject overly long summaries (force the agent to split)
3. **Dedup** — Cosine similarity against existing nodes. >0.92 → merge (inherit hitCount, update summary)
4. **Normalize** — Lowercase tags, unify hyphenation

The agent's Claude model does the thinking (splitting knowledge into seeds, choosing tags). The gateway does mechanical validation. Clean separation.

### Two States, Not Three

Previous designs had `fresh / amber / fossil`. Engram v2 simplifies to two states:

| State | Meaning | TTL |
|---|---|---|
| `recent` | Newly ingested, on probation | Yes (expires) |
| `fixed` | Earned permanence through use | No (permanent) |

There is no intermediate state. Either knowledge proves its value through recall hits, or it expires. This is metabolic selection — the same principle that governs biological fitness.

## The Problem No One Else Is Solving

As AI agents become more capable, they make decisions faster — and become more vulnerable to what they *don't see*. An agent that finds a stale file via grep will confidently build on it, never knowing a newer replacement exists two directories away. **What isn't visible doesn't exist.**

The industry's response is to make models bigger, contexts longer, training better. All of these improve the *brain*. None of them address a structural gap: **no one is watching what the agent fails to look at**.

Biological organisms don't survive on brains alone. The immune system, endocrine system, and autonomic nervous system protect the body independently of conscious thought. AI agents have nothing equivalent — until now.

## Behavioral Intelligence Layer

On top of the knowledge metabolism, engram runs a **receptor** — a passive sensory layer that monitors agent behavior in real-time through tool call hooks.

```
Agent tool calls → Receptor
  ├── Normalizer     — framework-agnostic event translation
  ├── Commander      — time-window behavioral analysis (5min / 30min / session)
  ├── PathHeatmap    — multi-index file access topology
  ├── Emotion Engine — 5-axis emotion vector (frustration, seeking, confidence, fatigue, flow)
  ├── Neuron Triangle — A/B/C three-layer firing model
  └── Shadow Index   — pre-neuron staleness detection
        │
        ▼
  Interpretation Layer
  ├── receptor-rules.json — declarative method definitions
  ├── Scoring engine      — signal × state × intensity × learnedDelta
  └── Output Router       — hotmemo / engram / file / silent
```

### Key Design Principles

1. **No LLM inference in the monitoring path** — Pure signal processing. Heatmaps, decay functions, threshold comparisons.
2. **The agent doesn't know it's being watched** — Receptor observes tool call hooks. Signals surface only when genuinely needed.
3. **Separation of detection and interpretation** — The emotion engine fires signals. What to *do* about them is decided by a separate layer with declarative rules.
4. **Field coupling, not direct control** — The Meta neuron adjusts thresholds by emitting fields, not commands. Each layer is autonomous.
5. **Time decay as the universal weight** — No arbitrary coefficients. Exponential decay with configurable half-lives.

## Subsystems

### Receptor — Behavioral Observation

The receptor translates raw tool calls into normalized events, tracks behavioral patterns across time windows, and computes a 5-axis emotion vector.

A three-layer neuron model governs signal firing:
- **A (Flow Gate)**: When the agent is in flow, all interventions are suppressed. Inviolable.
- **B (Emotion Engine)**: Dynamic thresholds adapt to the agent's baseline via EMA.
- **C (Meta Neuron)**: Observes B's firing patterns and adjusts B's thresholds through field emission. Never fires directly.

→ [Receptor Architecture](./receptor-architecture)

### Shadow Index — Pre-Neuron Staleness Detection

A 6-axis HeatNode (access count, opened, modified, lastModified, lastAccess, lastTouchedState) with a 3-stage staleness detector that expands scope progressively: siblings → ancestors → cross-directory filename index.

Operates as a **pre-neuron monitor** — detecting states that would never trigger the neuron system because the neuron's inputs don't contain the missing information.

→ [Shadow Index](./shadow-index)

### Future Probe — Predictive Knowledge Supply

Searches for relevant knowledge near the agent's current behavioral position. No linear extrapolation — search at the centroid of recent actions, filter by movement direction and emotion state.

Where Shadow Index validates *premises* (are you looking at the right files?), Future Probe validates *consequences* (will this lead where you think?). Together: a temporal safety net.

→ [Predictive Inference](./predictive-inference)

### Behavioral Prior — Body Memory

Information continuity (what you know) comes from engram's knowledge store. *Behavioral* continuity (how you move) comes from the Behavioral Prior — adapted thresholds, pattern distributions, emotion baselines saved across sessions.

The Persona system extends this to species-level collective experience via the Sphere network. Successful sessions export a statistical fingerprint. Other agents may encounter these personas through Future Probe projections — probabilistic, not guaranteed.

If engram is declarative memory (hippocampus), behavioral prior is procedural memory (cerebellum), and persona is inherited instinct (genetics).

## Why the Industry Won't Build This

The cost-benefit math doesn't work yet. An agent wastes 10 minutes on a stale file but still produces correct code — the output value exceeds the waste. "AI sometimes goes off track" is accepted as a limitation.

The real cost appears at scale. Autonomous agents traversing dozens of files with stale premises generate correction costs that grow nonlinearly. The agent believes it's succeeding — tests pass, types check, only the premises are wrong.

Framing this as "AI limitations" is the most dangerous outcome. It's not a limitation of the model. It's an **architectural absence** — missing monitoring infrastructure. A 10x context window still can't see files that weren't in the search results. A 10x parameter count still can't reason about what it hasn't observed.

Biology paid the cost of an immune system. Evolution kept it because organisms without one were eliminated by threats the brain couldn't perceive. When AI agents begin autonomously affecting production systems, the cost of unseen mistakes will justify this infrastructure. Until then, we build ahead.