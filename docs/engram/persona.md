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

## Relationship to Other Memory Layers

```
Individual experience → extrapolation    (my trajectory, extended)
Species knowledge     → prediction       (trajectories I haven't taken)
Species perception    → adaptation       (sensitivities I haven't developed)
                        ↑ this is Persona
```

A new agent starts not from zero but from the species' perceptual mean. Knowing fire is hot without having been burned — not because someone *told* you, but because your nervous system is pre-calibrated to flinch.