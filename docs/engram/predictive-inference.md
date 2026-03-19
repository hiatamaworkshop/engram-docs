# Predictive Inference — Emotion-Driven Foresight

> A third kind of information delivery. Not search. Not recommendation. An ambient system that prepares answers before the agent knows it needs them.

## Overview

The predictive inference system monitors the agent's behavioral stream implicitly, constructs a multi-dimensional emotion vector, and uses firing signals to trigger proactive knowledge retrieval. When the agent hits a wall, relevant knowledge is already waiting.

## Two-Stage Architecture

### Stage 1: Implicit Accumulation

```
Tool call hooks (all actions)
  → Normalize → embed → accumulate in knowledge DB
  → Batch cluster analysis → push back insights
```

- Hooks fire aggressively. Selection is the system's job, not the agent's
- Automated version of manual engram push — catches what the agent forgets to save
- Zero cost to the agent. Runs entirely in the MCP sidecar

### Stage 2: Predictive Probe

```
Receptor detects frustration/seeking spike → trigger
  → Build a simulation world from accumulated data (agent's knowledge map)
  → Inject current problem as a new node
  → Run simulation (consensus × N rounds)
  → Classify response patterns:
      merged   — already known, redundant
      resonant — related but novel angle, worth attention
      loner    — outside current focus, irrelevant now
  → Return results asynchronously
  → When the agent struggles, candidate solutions are already in hand
```

## The Emotion System Layer

The emotion system is responsible for **detection and firing only**. It is an independent layer that doesn't know what it's connected to. It fires signals. What those signals trigger is another layer's problem.

### Input Sources

| Input | Source | Emotional Contribution |
|---|---|---|
| Edit↔Bash alternation with failures | Tool hooks | frustration |
| Same-concept re-search with different terms | Grep hooks | frustration (strongest maze signal) |
| engram pull with zero results | MCP | seeking (strongest gap signal) |
| Search pattern diversity/convergence | Grep/Glob hooks | uncertainty / confidence |
| Elapsed time, total event volume | System | fatigue |
| Successful implementation chains | Tool hooks | flow |
| Sub-agent invocation frequency | Agent hooks | isolation |

### Path Heatmap as Emotional Input

The PathHeatmap isn't just structural data — its changes are direct emotional inputs:

| Heatmap Pattern | Emotional Contribution |
|---|---|
| Sudden hot-path shift | uncertainty (context switched) |
| Hot-path convergence | flow or frustration (distinguished by other axes) |
| First access to unknown path | seeking (entering new territory) |
| Same concept searched under different paths | frustration (strongest maze signal) |

### Command Pattern × Time Window

The same behavioral ratio means different things at different timescales:

```
Short (5 min):  Edit→Bash(fail)→Edit→Bash(fail)  → frustration spike
Medium (30 min): Grep ×30, Read ×20, Edit ×2       → seeking trend
Meta (session):  200+ commands, 2 hours elapsed     → fatigue accumulation
```

The **delta between windows** is the strongest signal: medium-term exploration shifting to short-term trial_error = "found something but it's not working" = frustration onset.

## Neuron Triangle

Three-layer model derived from a bio-inspired audio processing system. The same principles that manage real-time audio dynamics apply to behavioral pattern detection.

| Layer | Audio System | Receptor |
|---|---|---|
| **A (Hard)** | Instantaneous peak → immediate gain control. Threshold fixed. C cannot touch — inviolable safety valve | Flow detection. All interventions suppressed. No layer can modify flow threshold |
| **B (Soft)** | Sustained high level → gradual gain reduction. Threshold: ambient + offset + C's field | 5-axis emotion. Patterns → emotions. Threshold: behavioral baseline + offset + meta field |
| **C (Meta)** | Observes A/B firing patterns + environment changes. Adjusts B's threshold. Never controls gain directly | Observes frustration frequency, derives agent state. Adjusts emotion thresholds. Never fires directly |
| **Ambient** | EMA estimating "current listening level." Shared field entity | EMA estimating "agent's normal behavior level." Supplements Commander's time windows |

### Design Principles from the Biological Model

```
- A doesn't know B or C exist. Pure peak detection
- B doesn't know why its threshold changed. Responds to field state
- C controls nothing directly. Emits fields only
- No central authority — loose coupling through shared fields
- Each node behaves as an independent autonomous entity
```

### Verification-Based Hold/Release

Prevents signal flapping (oscillation around threshold):

```
fire: value > threshold → fire + hold ON
hold: value drops below → count consecutive sub-threshold events
      count ≥ 3 → release (genuinely safe)
      count < 3 → hold continues (would spike again if released)
```

Pumping is structurally impossible. In audio, this preserves listening quality. In the receptor, it preserves signal quality.

### Dynamic Thresholds via EMA

```
v1 (naive):    threshold = -15dB (fixed) → breaks when user changes volume
v2 (adaptive): threshold = ambientLevel + offset + C.fieldAdjustment
               ambientLevel = EMA tracking. Auto-adapts
```

Receptor equivalent:
```
Fixed:    SPIKE_THRESHOLD = 0.6 → breaks for different agent styles
Adaptive: threshold = behaviorBaseline + offset + meta.fieldAdjustment
          A grep-heavy developer → higher baseline → minor grep increase doesn't spike
          A grep-light developer → lower baseline → small grep increase triggers
```

## Trigger Design — Multi-Component Firing

### Firing Composition

A signal isn't a scalar. It carries the **composition** of what contributed:

```
Same frustration spike, different compositions, different responses:

frustration 0.7 + seeking 0.3 + trial_error
  → Can't find the solution while trial-and-erroring
  → Probe: error-context knowledge

frustration 0.7 + uncertainty 0.4 + wandering
  → Don't even know what to do
  → Probe: similar task history

frustration 0.7 + fatigue 0.5 + trial_error
  → Exhausted and still failing — most dangerous state
  → Alert: suggest break + save current knowledge
```

### Delivery Modes

| Mode | Agent Experience | Use Case |
|---|---|---|
| **silent** | Nothing visible. Background processing | Run probe, cache results |
| **passive** | Recommendation presented. Agent approves/dismisses | "Search related knowledge? Reason: ..." |
| **notification** | Results accumulated. Agent checks when ready | Probe results available on next watch |
| **active** | Results directly placed in agent's context | Formatted results in response |

**Constraints**:
- Active: maximum 1 item (multiple active items become noise)
- During `deep_work`: active forbidden, passive suppressed (silent/notification only)
- Passive dismissal → learnedDelta adjustment (reduce sensitivity for that pattern)

## Interpretation Layer — Decoupling Raw Signals from Actions

Raw firing compositions pass through an interpretation layer defined by external rules:

```
Emotion Engine → FiringComposition (raw values)
                      ↓
              receptor-rules.json (interpretation rules)
                      ↓
              Trigger candidates + delivery mode + reason text
```

### Structural Isomorphism with Mycelium

```
Mycelium:
  signal (raw) → perception matrix (species JSON) → reaction strength
  Different species react differently to the same signal

Receptor:
  FiringComposition (raw) → interpretation rules (JSON) → trigger selection
  Different rule sets react differently to the same firing pattern
```

This convergence is not coincidental. Field coupling + interpretation separation is the convergent solution for autonomous system design.

### Fire-Through Design

**Signals always fire through. Suppression happens in the interpretation layer, not at the neuron.**

If C suppresses B's firing by raising thresholds, no FiringComposition is generated — information is lost. The interpretation layer can't learn from what it never sees.

```
Revised flow:
  B fires freely → FiringComposition generated
    → Interpretation layer scores and decides:
       ├── score > threshold → deliver (active/passive/notification)
       ├── score > silent_threshold → silent (background processing)
       └── score < silent_threshold → drop (recorded in learnedDelta)
```

C still has value — lowering sensitivity reduces noise for the interpretation layer. But **genuine signals pass through**. The interpretation layer handles context-dependent suppression.

This mirrors the immune system: antigens are always recognized (T-cell receptor binding). "Not responding" is response suppression, not recognition suppression.

## Relationship to Existing Systems

### Engram + Mycelium = Sphere Prototype

The same principles — species design, consensus, receptor — operate at any scale. Engram + mycelium runs one user's knowledge base on one machine where behavior is visible. Sphere runs the same thing across N users × M domains where critical mass is needed to feel the effect.

### What This Is Not

- **Not RAG** — RAG retrieves on explicit query. This retrieves on implicit emotional signals before any query is made
- **Not recommendation** — Recommendations assume the agent knows what domain it's in. This detects *that something is wrong* before the agent does
- **Not model improvement** — Better models make better decisions with available information. This ensures the available information isn't stale or incomplete