# Rosen et al. Anti-Resonance — Future Integration Plan

## Status: STORED FOR FUTURE USE (not yet integrated into visualization)
## Date: 2026-02-15

---

## Source Paper
Rosen SJ, Witteveen O, Baxter N, Lach RS, Hopkins E, Bauer M, Wilson MZ.
"Anti-resonance in developmental signaling regulates cell fate decisions."
*eLife* 2025;14:RP107794. DOI: https://doi.org/10.7554/eLife.107794

## Key Findings

### What is anti-resonance?
At certain intermediate frequencies of Wnt pathway activation (~1/3 cycles/hr, ~3hr period),
pathway output (TopFlash reporter, Brachyury differentiation marker) is **suppressed** — cells
essentially ignore the signal. At both higher and lower frequencies, cells respond normally.
This creates a "band-stop filter" in the Wnt frequency response.

### Experimental system
- HEK293T "Wnt I/O" cells: optogenetic LRP6-Cry2 control + CRISPR β-catenin reporter + TopFlash
- H9 human embryonic stem cells: same tools, measuring Brachyury (mesoderm marker)
- 96-condition frequency × duty-cycle screen using LITOS illumination device

### Mathematical model

#### Full biochemical ODE (9 parameters, k1-k7 + d0 + c0):
```
dda/dt = k1·l(t)·(d0 - da(t)) - k2·da(t)
dc/dt  = -(k3·da(t) + k4 + k6·b(t))·c(t) + k4·c0 + (k5-k4)·cb(t)
dcb/dt = -k5·cb(t) + k6·c(t)·b(t)
db/dt  = k7 - k6·c(t)·b(t)
dg/dt  = rmax · (b(t-τ) - b̄)^n / ((b(t-τ) - b̄)^n + K^n)
```
Variables: da (active Dvl), c (free DC), cb (β-cat-DC complex), b (free β-catenin), g (TopFlash)

#### Hidden-variable abstraction (2 key parameters: kon, koff):
```
da/dt = kon·(1-a(t))   when l(t) = 1  (light on)
da/dt = -koff·a(t)     when l(t) = 0  (light off)
```
Anti-resonance condition: koff < (1 + ka)·kon
(Fast activation, slower deactivation creates the frequency dip)

### Anti-resonant frequency
- Observed: ~1/3 to 1 cycles/hr (period ~1-3 hours)
- Tunable by kon/koff ratio
- Stronger when kon >> koff

---

## Connection Points to PAR(2) and Crypt Model

### What IS biologically justified:

1. **Wnt drives crypt homeostasis** — The Wnt gradient along the crypt axis controls
   stem → TA → differentiated progression. Boman's k1-k5 rate constants depend on Wnt.

2. **Circadian clock gates Wnt** — Per2 interacts with β-catenin (Yang et al. 2009),
   circadian disruption enhances Wnt-driven tumorigenesis. PAR(2) Δ|λ| measuring
   circadian hierarchy strength is relevant to Wnt regulation.

3. **Both PAR(2) and anti-resonance say temporal dynamics matter** — PAR(2) shows
   persistence hierarchies; Rosen shows frequency-dependent filtering. Convergent
   evidence for the same principle at different timescales.

4. **Anti-resonance as cancer protection** — The paper explicitly connects to oncogenesis:
   "In the context of oncogenesis, where intermediate Wnt is a hallmark of many cancers
   (the 'Goldilocks Theory'), anti-resonance may act as a natural suppressor of intermediate
   signaling." (p.12)

### What requires CAUTION — known gaps:

1. **Different frequency regimes** — Anti-resonant dip is at ~3hr period; circadian is ~24hr.
   These are an order of magnitude apart. Cannot claim circadian oscillations operate at or
   near the anti-resonant frequency.

2. **|λ| ≠ frequency** — PAR(2) eigenvalue modulus measures temporal persistence, not
   oscillation frequency. No established mapping between Δ|λ| and kon/koff exists.

3. **Pathway-specific kinetics** — The hidden-variable model's anti-resonance condition
   (koff < (1+ka)kon) is specific to Wnt's fast-activation/slow-deactivation. Not yet
   demonstrated for circadian → Wnt coupling.

4. **No experimental link** — Nobody has measured whether circadian disruption shifts
   cells into/out of the anti-resonant band. Reasonable hypothesis, not established fact.

---

## Proposed Implementation (when ready to integrate)

### Option A: Reference Panel (RECOMMENDED — scientifically safe)
Add a "Wnt Signal Processing" collapsible panel below the Boman/PAR(2) descriptions.
Shows the Rosen frequency-response curve as an independent piece of biology.
Clear language: "Rosen et al. showed..." / "this suggests..."
NOT coupled to the gap slider.

### Option B: Interactive Anti-Resonance Curve (requires stronger framing)
Add a Recharts plot showing TopFlash vs frequency with the characteristic dip.
Could allow toggling kon/koff to see how the dip moves.
Would need explicit disclaimer that this is illustrative, not coupled to PAR(2) measurements.

### Option C: Full Integration (NOT RECOMMENDED without new data)
Couple the gap slider to the anti-resonance curve shape.
Would require establishing a formal Δ|λ| → kon/koff mapping.
This does not currently exist in the literature.

### Suggested framing text:
"Rosen et al. (eLife 2025) demonstrated that the Wnt pathway exhibits anti-resonance —
suppressing output at intermediate activation frequencies (~1/3 cycles/hr). This frequency-
dependent filtering acts as a natural noise suppressor, potentially protecting against
spurious Wnt activation. While operating at different timescales than the circadian
oscillations measured by PAR(2), both findings converge on a shared principle: the temporal
structure of Wnt signaling, not just its amplitude, is critical for maintaining crypt homeostasis
and preventing oncogenic transformation."

### Reference to add to references.bib:
```bibtex
@article{Rosen2025,
  author  = {Rosen, Samuel J and Witteveen, Olivier and Baxter, Naomi and Lach, Ryan S and Hopkins, Erik and Bauer, Marianne and Wilson, Maxwell Z},
  title   = {Anti-resonance in developmental signaling regulates cell fate decisions},
  journal = {eLife},
  year    = {2025},
  volume  = {14},
  pages   = {RP107794},
  doi     = {10.7554/eLife.107794}
}
```

---

## Key Equations for Future Implementation

### Frequency response computation (for plotting)
Given kon, koff, ka (β-cat degradation rate), kb (β-cat synthesis rate):

For a square wave input with frequency f and duty cycle D:
- Period T = 1/f
- Light ON duration: D·T
- Light OFF duration: (1-D)·T

Steady-state a(t) cycles between:
- a_max = 1 - (1-a_min)·exp(-kon·D·T)
- a_min = a_max·exp(-koff·(1-D)·T)

Solving: a_min = (1-exp(-kon·D·T))·exp(-koff·(1-D)·T) / (1 - exp(-kon·D·T - koff·(1-D)·T))

Mean β-catenin and TopFlash can then be computed numerically for each frequency.

### Parameter values from paper (HEK293T):
- k1 = 0.1 min⁻¹ (Dvl activation rate)
- k2 = 0.01 min⁻¹ (Dvl deactivation rate)
- k3 = fitted (DC inactivation by Dvl)
- k4 = fitted (DC activation rate)
- k5 = fitted (β-cat-DC dissociation)
- k6 = fitted (β-cat-DC binding)
- k7 = fitted (β-cat synthesis)
- Hill function: n, K, rmax, τ (delay ~hours)

### Hidden-variable fitted parameters:
- kon ≈ 0.1 min⁻¹
- koff ≈ 0.01 min⁻¹
- ka ≈ 0.005 min⁻¹
- Anti-resonance appears when koff < (1 + ka/ka_ref)·kon
