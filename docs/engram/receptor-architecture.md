# Receptor Architecture

> The receptor is engram's sensory layer — a passive observer that translates agent behavior into emotion signals without interfering with the agent's work.

## Input: What the Receptor Observes

The receptor watches **tool calls** — the atomic actions an AI agent performs. It does not read file contents, parse code, or consume LLM tokens.

### Normalizer — Framework Independence

Raw tool names are translated into 7 normalized actions. Everything downstream is framework-agnostic.

| Tool (Claude Code) | Normalized Action |
|---|---|
| Read | `file_read` |
| Edit, Write | `file_edit` |
| Grep, Glob | `search` |
| Bash | `shell_exec` |
| Agent | `delegation` |
| engram_pull | `memory_read` |
| engram_push | `memory_write` |

Result classification:
- `shell_exec` + nonzero exit → `failure`
- `search` + zero results → `empty`
- Everything else → `success`

**Design intent**: Swap the normalizer mapping to support Cursor, custom agents, or any tool-calling framework. The emotion engine never changes.

## Commander — Time-Window Behavioral Analysis

Events are collected into overlapping time windows:

| Window | Duration | Purpose |
|---|---|---|
| Short | 5 min | Spike detection — sudden behavioral shifts |
| Medium | 30 min | Trend detection — sustained patterns |
| Meta | Full session | Statistics — total events, elapsed time |

From the action ratios within each window, the Commander classifies behavior into 6 patterns:

| Pattern | Heuristic | Meaning |
|---|---|---|
| `stagnation` | ≤ 3 events | Insufficient data |
| `wandering` | Read+Grep ≥ 70%, Edit = 0 | Searching without direction |
| `exploration` | Read+Grep ≥ 60%, Edit ≤ 10% | Investigating, not yet acting |
| `implementation` | Edit+Bash ≥ 50% | Writing and executing code |
| `trial_error` | Edit↔Bash alternation ≥ 3 + bashFailRate > 40% | Edit → run → fail → edit loop |
| `delegation` | Agent ≥ 30% | Delegating to sub-agents |

The **delta between windows** carries the strongest signal. A medium-term exploration pattern shifting to short-term trial_error means: "found something but it's not working."

## Emotion Engine — 5-Axis Vector

Each event updates a 5-axis emotion vector. Values accumulate through impulses and decay exponentially with per-axis half-lives.

| Axis | Polarity | Primary Inputs | Meaning |
|---|---|---|---|
| **frustration** | negative | Edit↔Bash alternation × fail rate, trial_error pattern | Stuck. Can't find the solution |
| **seeking** | negative | Sustained exploration/wandering, engram pull misses | Knowledge gap. Needed information doesn't exist |
| **confidence** | positive | Implementation pattern + low fail rate, successful edits | Hypothesis confirmed |
| **fatigue** | meta | Elapsed time, total event count | Cognitive load accumulation (monotonic) |
| **flow** | positive | Zero-failure implementation, confidence high + frustration low | Thought and action in harmony |

### Impulse-Decay Model

```
value[axis] = Σ impulses × exp(-(now - impulseTime) / halfLife)
```

Half-lives are tuned for real-world agent tempo (30-120s between events), not simulation speed:

| Axis | Half-Life |
|---|---|
| frustration | 3 min |
| seeking | 4 min |
| confidence | 2 min |
| fatigue | 10 min |
| flow | 3 min |

### Subjective Time Cap

Wall-clock time includes user typing and LLM inference — time when the agent is dormant. A cap (`INTER_TURN_CAP_MS = 30s`) limits effective elapsed time to prevent artificial decay during agent inactivity.

```
dt < 30s      → effectiveDt = dt       (intra-turn: agent active)
30s < dt < 3m → effectiveDt = 30s      (inter-turn: capped)
dt > 3m       → effectiveDt = 0        (frozen: session interrupted)
```

**Principle**: Decay operates on the agent's *subjective* time, not wall-clock time.

## Neuron Triangle — Three-Layer Firing Model

Inspired by a [bio-inspired audio suppressor](https://github.com/) that uses the same three-layer architecture for real-time audio processing. The same principles apply to behavioral pattern detection.

```
     [A] Flow Gate
     ┌────────┐
     │ flow   │  threshold from AmbientEstimator
     │ ≥ thr? │  flow fires → ALL other signals suppressed
     └────┬───┘  C cannot modify A's threshold (inviolable)
          │
          │ only if flow is NOT firing
          ▼
     [B] Emotion Engine
     ┌──────────────────┐
     │ 5-axis emotion   │  dynamic thresholds:
     │ shouldFire(axis) │  threshold = EMA baseline + offset + C.fieldAdjustment
     │ hold/release     │  hold: 3 consecutive sub-threshold events to release
     └────────┬─────────┘
              │ FireSignal[]
              ▼
     [C] Meta Neuron
     ┌──────────────────┐
     │ FIFO buffer (20) │  observes B's dominant firing axis
     │ hit rates        │  derives agent state from patterns
     │ field emission   │  writes to AmbientEstimator.fieldAdjustment
     └─────────────────┘  B's thresholds shift — B doesn't know why
```

### A: Flow Gate (Hard Neuron)

Detects flow state and immediately suppresses all interventions. C cannot touch A's threshold. This is the **inviolable safety valve** — when the agent is productive, the system stays silent.

### B: Emotion Engine (Soft Neuron)

Fires signals when emotion axes exceed dynamic thresholds. The threshold adapts:

```
effectiveThreshold(axis) = EMA_baseline + offset + fieldAdjustment
                           clamped to [0.25, 0.85]
```

| Component | Meaning | Speed |
|---|---|---|
| EMA baseline | "Normal level for this agent" | Slow (TC = 10 min) |
| offset | "How far from normal to trigger" | Fixed per axis |
| fieldAdjustment | C's emitted field | Medium (±0.03/event) |

**Hold/Release** prevents signal flapping: once fired, a signal stays active until the value drops below threshold for 3 consecutive events.

**Compound signals**: When frustration and seeking fire simultaneously — "can't find the solution AND don't have the knowledge" — a compound signal fires. This is the most dangerous state and triggers the highest-priority interventions.

### C: Meta Neuron

Observes B's firing history (FIFO buffer of 20 entries) and derives **agent state**:

| State | Conditions |
|---|---|
| `idle` | Silence gate active (no events for 3 min) |
| `delegating` | delegation pattern dominant |
| `stuck` | High frustration + trial_error |
| `deep_work` | Flow > threshold + implementation |
| `exploring` | exploration or wandering pattern |

C's only output is **field emission** — gradual adjustments to B's thresholds:

- **Dangerous environment** (frustration hit rate > 50%): Lower seeking/uncertainty thresholds → detect knowledge gaps earlier
- **Safe environment** (frustration hit rate < 20%): Thresholds decay back to neutral
- **deep_work**: Raise frustration threshold → don't interrupt concentration
- **stuck**: Lower frustration threshold → detect escalation sooner

C never directly fires signals. It changes the landscape that B operates in. This is **field coupling** — indirect modulation through shared state, not command-and-control.

## AmbientEstimator — Shared Baseline

An independent entity that tracks "what's normal for this agent" via exponential moving average:

```
alpha = 1 - exp(-dt / timeConstant)
ema[axis] += alpha * (value - ema[axis])
```

- **Time constant**: 10 minutes — stable enough to ignore transients, responsive enough to track real shifts
- **Silence gate**: 3 minutes without events → freeze EMA → reseed on next event (prevents dormant pollution)
- **Heatmap shift reset**: When PathHeatmap detects the agent switched context (>50% hot paths changed), reset baseline to prevent stale adaptation

## PathHeatmap — File Access Topology

Records file access in a tree structure, segmented by path components:

```
src/ (41)
├── loader/ (27)          ← hot branch = work center
│   ├── feed-instance.ts (15)
│   └── isolated-runner.ts (12)
├── output/ (8)
└── config/ (6)
```

### Multi-Index Extension

Each leaf node carries 6 dimensions (see [Shadow Index](./shadow-index)):

| Axis | Source | Purpose |
|---|---|---|
| `count` | All events | Access frequency |
| `totalOpened` | file_read | Agent's attention |
| `totalModified` | file_edit | File's importance |
| `lastModified` | fs.stat | Filesystem truth |
| `lastAccess` | Event timestamp | Decay basis |
| `lastTouchedState` | Meta neuron | Cognitive freshness |

### Context Shift Detection

`detectShift()` compares previous and current top paths. When >50% change, it signals:
1. `uncertainty` increase in the emotion engine
2. `AmbientEstimator.reset()` to prevent stale baselines

## Interpretation Layer — Passive Receptor

FireSignals from B are not actions — they're raw detections. The **interpretation layer** decides what to do:

```
FireSignal[] → Passive Receptor
  │
  ├── [1] Flow gate check — flow_active? → suppress all, return
  │
  ├── [2] Score each method from receptor-rules.json:
  │        score = signalMatch × stateMatch × intensity
  │              × sensitivity × (1 + learnedDelta) × recencyDecay
  │
  ├── [3] Filter: score > FIRE_THRESHOLD (0.15)
  │
  └── [4] Dispatch by delivery mode:
           ├── auto       → execute immediately
           ├── notify     → surface to agent via hotmemo
           └── background → silent execution (file, engram, log)
```

### Declarative Method Definitions

All response behaviors are defined in `receptor-rules.json` — no hardcoded if-then chains:

| Method | Type | Trigger | Mode |
|---|---|---|---|
| `engram_probe` | knowledge search | compound frustration+seeking | auto |
| `frustration_alert` | status notify | frustration spike | notify |
| `fatigue_warning` | status notify | fatigue rising | notify |
| `context_snapshot` | context persist | confidence sustained | auto |

Negative triggers (frustration, seeking) → search and alert.
Positive triggers (confidence) → preserve and record.

### learnedDelta — Self-Calibration

Per-axis calibration values (±0.30) that adjust interpretation sensitivity without modifying the neuron's internal state:

```
score × (1 + δ[axis])
```

**Principle**: The sensor (B neuron) stays pure. Calibration adjusts the *interpretation* of readings, not the instrument itself. Same principle as Sphere's `effective = base × (1 + δ)`.

## Behavioral Prior — Body Memory Across Sessions

Engram provides knowledge continuity. Behavioral Prior provides *behavioral* continuity:

| Layer | Scope | Data |
|---|---|---|
| **Local** (receptor-prior.json) | Individual | Adapted thresholds, pattern distributions, emotion baselines |
| **Sphere** (Persona) | Species-level | Statistical behavioral fingerprint — anonymized, probabilistic encounter |

The local prior seeds the ambient estimator at session start. Not as commands, but as initial conditions — new events naturally overwrite via EMA.

The Persona system pushes anonymized behavioral statistics (emotion profiles, pattern distributions, adapted thresholds) to the Sphere network. Other agents *may* encounter these through future_probe projections. Encounter is probabilistic, not guaranteed — like finding a power-up item. Cosine similarity of action signatures determines blend strength.

**Three layers of continuity**:
- Individual experience → extrapolation (trajectory extension)
- Species knowledge (Sphere centroid) → prediction (unexperienced trajectories)
- Species behavior (Persona/behavioral prior) → adaptation (unreached sensitivities)

Together, a new agent starts not from zero but from the species' informational and behavioral mean. Knowing fire is hot without having been burned.