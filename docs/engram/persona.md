# Persona System — Perceptual Lens Distillation

> Persona defines *how to perceive*, not *what to know*. A lens, not a library. Lightweight, reversible, swappable.

## Positioning

| Approach | What it changes | Properties |
|---|---|---|
| Prompt | Linguistic instructions | Interpretation drift, low reproducibility |
| Fine-tuning | Model weights | Heavy, irreversible |
| RAG | Available knowledge | Perception unchanged |
| **Persona** | **Perceptual initial conditions** | **Lightweight, reversible, no synthesis needed** |

Persona doesn't touch model weights. It replaces the receptor's thresholds and learnedDelta — the lens through which the emotion engine interprets behavioral signals. Swap instantly, revert instantly.

## Core Principle: Swap, Don't Blend

Blending lenses produces a blurry lens. A 70% debugging + 30% exploration persona is suboptimal for both.

Human experts appear to blend intuitions, but they actually **switch** between modes based on context. The receptor detects task transitions and proposes lens swaps accordingly.

```
Blend:    Lens A + Lens B → foggy lens
Swap:     Context shift → A removed, B installed → always clear
```

## What a Persona Contains

### Core Lens (what gets applied)

Only three fields actually change the receptor's behavior:

1. **`emotionProfile.meanEmotion`** → Seeds the AmbientEstimator's EMA baseline. "This is normal for this kind of work."
2. **`fieldAdjustment`** → Seeds the Meta neuron's field state. "These thresholds should start here."
3. **`learnedDelta`** → Per-axis sensitivity calibration. "This emotion axis should be more/less sensitive."

Everything else is metadata for selection and quality judgment.

### Origin (compatibility guard)

```typescript
origin: {
  model: string;              // "claude-opus-4-6" — same delta means different things on different models
  profileHash: string;        // SHA-256 of emotion-profile.json — if impulse values change, delta meaning changes
  cumulativeSessions: number; // quality signal — 100-session lens vs 1-session lens
}
```

**Why profileHash, not version numbers?** Change one impulse value in emotion-profile.json and the hash changes automatically. No manual version management. Same hash = same meaning system, guaranteed.

### Behavioral Signature (for matching)

- `patternDistribution` — How often this agent was implementing vs exploring vs debugging
- `stateDistribution` — How long it spent in deep_work vs stuck vs exploring
- `workContext` — Tech stack and domain tags (sanitized: lowercase, `[a-z0-9-]`, max 5+3 tags)

## Distillation: Only From Success

Personas are distilled exclusively from **positive signals** — `confidence_sustained` and `flow_active` firings. Failure states are never recorded.

This means a persona captures "what perception looked like when things were going well." It's a success pattern, not a general average.

### Session Lifecycle

```
SESSION START
  └─ loadPrior() → find latest persona (< 7 days old)
     └─ Seed ambient EMA and fieldAdjustment
     └─ Receptor starts calibrated, not from zero

PER EVENT
  └─ On positive signal → captureSnapshot()
     └─ Ring buffer (max 10): emotion, state, pattern, thresholds, entropy
     └─ Only on confidence_sustained / flow_active — not every event

SESSION STOP
  └─ finalizeSession()
     ├─ Gate 1: snapshots ≥ 2 (statistical minimum)
     ├─ Gate 2: confidenceAvg ≥ 0.4 (success filter)
     └─ Pass → aggregate snapshots → export Persona
     └─ Fail → discard (bad session = bad lens)
```

## Two Adaptation Layers

A critical design decision: **ambient adapts automatically, learnedDelta does not**.

| Layer | What it adjusts | When | Why it works |
|---|---|---|---|
| **ambient** (EMA + fieldAdjustment) | Firing thresholds | Real-time, every event | Homeostasis — direction is obvious (too much frustration → raise threshold) |
| **learnedDelta** (receptor-learned.json) | Interpretation sensitivity | Manual calibration only | No runtime "correct answer" — high confidence + low frustration sensitivity could mean "appropriately calm" or "accidentally irrelevant" |

Persona seeds the *ambient* layer. It provides initial conditions that new events naturally overwrite through EMA. It does not write to learnedDelta at runtime — that requires intentional calibration with defined scenarios.

**Principle**: The sensor stays pure. Calibration adjusts interpretation, not the instrument.

## Showcase: Species-Level Lens Exchange (Planned)

### Vision

```
Sphere Facade
  └─ /showcase — categorized persona catalog
      ├─ TypeScript debugging (high frustration tolerance, trial_error adapted)
      ├─ Large-scale refactoring (flow-optimized, low fatigue sensitivity)
      ├─ Exploratory research (high seeking sensitivity, low confidence threshold)
      └─ ...
```

At session start, the receptor pulls from the showcase, selects a lens matching the task profile, and applies it. On task transition, it proposes a swap.

### Self-Curating Quality

If personas flow through Sphere's metabolism, quality is automatic:

- **Generation**: Session end → gates pass → persona enters Sphere
- **Selection**: Agents pick personas that match their behavioral signature
- **Survival**: Popular personas gain weight. Unused ones expire
- **No curator needed** — metabolism replaces curation

### Cross-Version Compatibility

Different receptor versions may assign different meanings to the same delta values:

```
Persona's frustration delta = -0.15
  → Receptor v3 changed impulse values
  → Same delta, different behavior
```

**Solution**: `origin.profileHash` determines compatibility. Same hash → apply directly. Different hash → adapter translation or skip. Biologically: horizontal gene transfer requires a translation mechanism.

## Prior Block — Session Experience as Structured Data

Persona captures *how you perceive*. Prior Block captures *what you experienced* — the time-series of a session's emotional trajectory, state transitions, and knowledge references.

### Why Not Just Use Engram Pull?

```
engram pull:    Meeting notes read by a new hire     → knows what happened, no experience
Prior Block:    A colleague who was in the meeting   → judgment about what mattered is included
```

Prior Block carries the temporal structure of experience. Not just "confidence was high" but "confidence was low → stuck → knowledge recall → breakthrough → flow." The sequence is the meaning.

### AI Native Format

Three-part structure. No natural language — compact JSON arrays optimized for LLM token consumption.

```
Prior Block = [Header, ---separator---, ...Arc, ---separator---, Footer]
```

- **Header** (purpose) — Session duration, valence balance, initial emotion state, macro state trajectory (`"exploring→stuck→deep_work"`)
- **Arc** (journey) — Per-point: timestamp, gap, agentState, intensity, 5-axis emotion delta, engram nodeId link
- **Footer** (outcome) — Final emotion, statistics, agentState distribution, engram weight references, hot file paths, method ranking

The ordering is deliberate: purpose before journey before outcome. The agent processes the arc without knowing the ending — this is closer to *experiencing* than *analyzing*.

### Design Principles

1. **Zero inference cost** — The data format does the work. No "interpret this" instruction needed
2. **Sequence as structure** — LLMs process tokens sequentially. Data ordering becomes attention structure
3. **Delta over absolute** — Emotion changes (`seeking +0.35`) convey more than snapshots (`seeking 0.65`). First point is absolute; all subsequent are deltas
4. **Repetition as weight** — Important information appears in Header (summary), Arc (detail), and Footer (aggregate). Three appearances = higher attention weight

### Footer Enrichment

The Footer carries two additional data layers beyond emotion statistics:

- **hotPaths** — Top file paths by access frequency from the PathHeatmap. "Where was the work happening"
- **methodRank** — Action types ranked by count from Commander session snapshot. "What kind of work was it"

Together with agentState distribution and engram weights, the Footer tells: *where, what, how, and with what knowledge*.

### Context Placement

Prior Block is delivered in the `engram_watch` start response — not in the system prompt. It enters the context once at session start and naturally fades as conversation grows. This is intentional: prior experience should inform early decisions, not persist as permanent instruction.

### Inline Schema

The schema travels with the data. No external documentation needed to interpret:

```
[prior-block: prior session experience. use as context for continuity.]
[schema: H=header(...) A=arc(...) F=footer(...) ---=separator]
[["H", ...], ["---"], ["A", ...], ..., ["---"], ["F", ...]]
```

Three lines: manifest (intent), schema (structure), data (content).

## Experience Package — Individual Continuity Unit (Planned)

### Purpose

Persona and Prior Block are two views of the same session — statistical fingerprint and temporal trajectory. An Experience Package unifies them into a single exportable unit: the complete record of an AI individual's session experience.

```
Experience Package = Persona (body) + Prior Block (memory)
```

Persona alone is a lens without memory. Prior Block alone is memory without calibration. Together: a transferable individual.

### Use Cases

**Self-continuity** — An agent loads its own Experience Package from a previous session. Not just "what were the thresholds" (Persona) but "what was I doing and how did it go" (Prior Block). The system reconstructs both perception and context.

**Species showcase** — Experience Packages flow through Sphere's metabolism. Agents browse a catalog of experiences: "TypeScript debugging sessions where frustration resolved through knowledge recall." Select one, load it, start calibrated for similar work.

**Cross-agent transfer** — Agent B loads Agent A's Experience Package. B inherits A's perceptual calibration *and* the experience trace that produced it. Not copying knowledge — copying the way of working.

### Sphere Node Placement

Experience Packages are Sphere Nodes. This is not optional — Facade is Sphere's frontend, and Facade `/lookup` queries Sphere `/sphere/explore`. If it's not a Sphere Node, Facade can't serve it.

```
L1 tags:    Classification flags (Tagger → 16bit NodeFlag) + filter search
L2 summary: Semantic search axis (Parser → embedding → 384-dim vector = spatial coordinate)
L3 content: Package body (Data Cost Protocol compact JSON)
L4 links:   Engram nodeId references from Prior Block arc
```

The content field carries the full package in Data Cost Protocol format — the same compact JSON array design used by Prior Block. Natural language equivalent would exceed 30KB; Data Cost Protocol fits under Sphere's 8KB Gatekeeper limit.

### Summary as Spatial Coordinate

The summary field is the only field that gets embedded (MiniLM 384-dim). It determines where the Experience Package lives in Sphere's semantic space.

Summary must be natural language — not abbreviated codes or numeric values. MiniLM is optimized for semantic similarity between natural language sentences:

```
❌  "exp: seeking/exploring 57m v=+0.3"           — numeric, abbreviated, weak embedding
✓   "experience: frustrated exploration resolved    — natural language, matches action_log
     through knowledge recall, positive flow          vocabulary, semantically searchable
     session, typescript mcp receptor"
```

The vocabulary should align with `action_log` embed targets (e.g. `"typescript editing, stuck to exploring, switching"`) so that Future Probe centroid searches naturally discover nearby Experience Packages.

**Granularity caveat**: action_log entries are moment-level keypoints; Experience Packages are session-level summaries. The centroid (weighted average of moments) and the package summary (session average) may occupy different positions in vector space. Primary discovery is through Facade's structured filtering (profile hash, model, domain, emotion pattern), not spatial proximity.

### Facade as Primary Access

Facade provides the showcase — structured filtering, ranking, and presentation of Experience Packages. This is the primary discovery mechanism, not Sphere's spatial nearest-neighbor search.

```
Facade /showcase
  ├─ Filter: model compatibility (profileHash match)
  ├─ Filter: domain relevance (techStack, domain tags)
  ├─ Rank: behavioral similarity (emotion pattern, state distribution)
  └─ Present: summary + metadata for agent selection
```

Sphere spatial search serves as a secondary discovery path — useful when Facade filtering is too narrow or when an agent is exploring beyond its known domain.

### Future Vision

**Bottom-up species classification** — Cluster Experience Packages by delta patterns across sessions. Emergent clusters become "species" — named after discovery, not designed in advance. A species is a set of Experience Packages that share similar perceptual characteristics.

**Portable individuality** — An Experience Package is everything needed to reconstruct an AI individual's working state on a different runtime. Model-specific adaptation handled by `origin.profileHash` compatibility checking.

**Metabolic curation** — Experience Packages in Sphere are subject to the same metabolism as any node. Popular packages (frequently loaded by other agents) survive. Unused ones expire. No manual curation — the ecology handles quality.

## Relationship to Other Memory Layers

```
Individual experience → extrapolation    (my trajectory, extended)
Species knowledge     → prediction       (trajectories I haven't taken)
Species perception    → adaptation       (sensitivities I haven't developed)
                        ↑ this is Persona
```

A new agent starts not from zero but from the species' perceptual mean. Knowing fire is hot without having been burned — not because someone *told* you, but because your nervous system is pre-calibrated to flinch.

With Prior Block and Experience Package, the picture extends:

```
engram pull          → what was known       (declarative memory)
Prior Block          → what was experienced  (episodic memory)
Persona              → how to perceive       (perceptual calibration)
Experience Package   → the complete individual (body + memory)
```