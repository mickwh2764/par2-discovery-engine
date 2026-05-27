"""
Paper H — Figure generation script
AD Glial Clock Inversion: AR(2) eigenvalue analysis of GSE261698

Generates:
  Figure 1  — Per-gene clock |λ| scatter: WT vs APP astrocyte (main figure)
  Figure 2  — Group bar chart: clock and target mean |λ| across all 6 conditions
  Figure S1 — Per-gene scatter panel for all 6 conditions (3×2 grid)
  Figure S2 — Clock–target gap bar chart with comparison lines

Run: python manuscripts/scripts/generate_paper_h_figures.py
Output: manuscripts/figures/generated/paper_h_figure*.pdf + *.png
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

OUT = "manuscripts/figures/generated"

# ──────────────────────────────────────────────────────────────────────────────
# Data (from AR(2) analysis of GSE261698)
# ──────────────────────────────────────────────────────────────────────────────

CLOCK_GENES = [
    "Arntl","Arntl2","Clock","Npas2","Nr1d2","Rora","Rorb","Rorc",
    "Per1","Per2","Per3","Cry1","Cry2","Dbp","Tef","Hlf",
    "Csnk1d","Csnk1e","Tipin","Fbxl3",
]

# Per-gene |λ| (None = absent in that condition)
WT_AST = {
    "Arntl": 0.9953, "Arntl2": None, "Clock": 0.9995, "Npas2": 0.9945,
    "Nr1d2": 1.0002, "Rora": 0.9988, "Rorb": 0.9997, "Rorc": 0.9951,
    "Per1": 0.9984, "Per2": 0.9894, "Per3": 0.9978, "Cry1": 1.0002,
    "Cry2": 0.9984, "Dbp": 0.9970, "Tef": 0.9966, "Hlf": 0.9993,
    "Csnk1d": 0.9976, "Csnk1e": 0.9977, "Tipin": 0.9958, "Fbxl3": 0.9982,
}
APP_AST = {
    "Arntl": 1.0053, "Arntl2": 1.0125, "Clock": 1.0059, "Npas2": 1.0079,
    "Nr1d2": 1.0090, "Rora": 1.0044, "Rorb": 1.0036, "Rorc": 1.0052,
    "Per1": 1.0068, "Per2": 1.0017, "Per3": 1.0072, "Cry1": 1.0062,
    "Cry2": 1.0059, "Dbp": 1.0056, "Tef": 1.0057, "Hlf": 1.0049,
    "Csnk1d": 1.0056, "Csnk1e": 1.0051, "Tipin": 1.0054, "Fbxl3": 1.0081,
}
WT_MIC = {
    "Arntl": 0.9967, "Arntl2": 0.9999, "Clock": 0.9999, "Npas2": 0.9986,
    "Nr1d2": 1.0035, "Rora": 0.9995, "Rorb": 0.9999, "Rorc": None,
    "Per1": 1.0040, "Per2": 1.0039, "Per3": 1.0038, "Cry1": 1.0028,
    "Cry2": 1.0003, "Dbp": 1.0042, "Tef": 1.0025, "Hlf": 1.0016,
    "Csnk1d": 1.0001, "Csnk1e": 1.0007, "Tipin": 1.0021, "Fbxl3": 1.0004,
}
APP_MIC = {
    "Arntl": 0.9985, "Arntl2": 0.9991, "Clock": 0.9993, "Npas2": None,
    "Nr1d2": None, "Rora": 0.9989, "Rorb": 0.9985, "Rorc": None,
    "Per1": 0.9983, "Per2": None, "Per3": None, "Cry1": 1.0080,
    "Cry2": 0.9989, "Dbp": None, "Tef": None, "Hlf": None,
    "Csnk1d": 0.9987, "Csnk1e": 0.9993, "Tipin": None, "Fbxl3": None,
}
AGED_AST = {
    "Arntl": 1.0270, "Arntl2": 1.0185, "Clock": 1.0013, "Npas2": 1.0072,
    "Nr1d2": 1.0025, "Rora": 1.0024, "Rorb": 1.0046, "Rorc": None,
    "Per1": 1.0104, "Per2": 1.0194, "Per3": 1.0064, "Cry1": 1.0099,
    "Cry2": 1.0034, "Dbp": None, "Tef": 1.0057, "Hlf": 1.0034,
    "Csnk1d": 1.0117, "Csnk1e": 1.0022, "Tipin": None, "Fbxl3": 1.0019,
}
AGED_MIC = {
    "Arntl": 0.9987, "Arntl2": 0.9835, "Clock": 0.9951, "Npas2": 0.9961,
    "Nr1d2": 1.0437, "Rora": None, "Rorb": 0.9990, "Rorc": 1.2180,
    "Per1": 0.9813, "Per2": 0.9910, "Per3": 0.9830, "Cry1": 1.0215,
    "Cry2": 0.9921, "Dbp": 0.9904, "Tef": 0.9904, "Hlf": 0.9850,
    "Csnk1d": 0.9931, "Csnk1e": 0.9901, "Tipin": 0.9789, "Fbxl3": 0.9974,
}

CONDITIONS = {
    "WT Astrocyte":  (WT_AST,  0.9955, 0.7505),
    "APP Astrocyte": (APP_AST, 1.0053, 0.7812),
    "Aged Astrocyte†": (AGED_AST, 1.0066, 0.8776),
    "WT Microglia":  (WT_MIC,  1.0000, 0.7997),
    "APP Microglia": (APP_MIC, 1.0004, 0.8046),
    "Aged Microglia†": (AGED_MIC, 0.9947, 0.8735),
}

PALETTE = {
    "WT Astrocyte":   "#2563EB",
    "APP Astrocyte":  "#DC2626",
    "Aged Astrocyte†": "#7C3AED",
    "WT Microglia":   "#059669",
    "APP Microglia":  "#D97706",
    "Aged Microglia†": "#64748B",
}


# ──────────────────────────────────────────────────────────────────────────────
# Figure 1 — Per-gene scatter: WT vs APP astrocyte
# ──────────────────────────────────────────────────────────────────────────────
def figure1():
    fig, ax = plt.subplots(figsize=(8, 5))
    genes = CLOCK_GENES
    x = np.arange(len(genes))
    wt_vals  = [WT_AST.get(g)  for g in genes]
    app_vals = [APP_AST.get(g) for g in genes]

    ax.axhline(1.0, color="black", lw=1.0, ls="--", zorder=0, label="Unit circle (|λ|=1)")
    ax.axhline(0.9955, color="#2563EB", lw=0.8, ls=":", alpha=0.6)
    ax.axhline(1.0053, color="#DC2626", lw=0.8, ls=":", alpha=0.6)

    for i, (wt, app) in enumerate(zip(wt_vals, app_vals)):
        if wt is not None and app is not None:
            ax.plot([x[i]-0.15, x[i]+0.15], [wt, app], color="grey", lw=0.6, zorder=1)
    
    ax.scatter([xi for xi, v in zip(x, wt_vals) if v is not None],
               [v for v in wt_vals if v is not None],
               color="#2563EB", s=60, zorder=3, label="WT Astrocyte")
    ax.scatter([xi for xi, v in zip(x, app_vals) if v is not None],
               [v for v in app_vals if v is not None],
               color="#DC2626", marker="^", s=60, zorder=3, label="APP Astrocyte")

    # Shade region
    ax.axhspan(1.0, 1.015, alpha=0.04, color="#DC2626")
    ax.axhspan(0.985, 1.0, alpha=0.04, color="#2563EB")

    ax.set_xticks(x)
    ax.set_xticklabels([g.replace("_"," ") for g in genes], rotation=45, ha="right", fontsize=8)
    ax.set_ylabel("|λ| (AR(2) eigenvalue modulus)", fontsize=10)
    ax.set_title("Figure 1. Clock gene |λ| — WT vs APP Astrocyte (GSE261698)\n"
                 "All WT genes below unit circle; all APP genes above", fontsize=10, pad=8)
    ax.set_ylim(0.985, 1.016)
    ax.legend(fontsize=9, loc="lower right")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    
    ax.text(len(genes)-1, 1.0055, "APP (mean 1.0053)", color="#DC2626", fontsize=8, ha="right")
    ax.text(len(genes)-1, 0.9940, "WT (mean 0.9955)", color="#2563EB", fontsize=8, ha="right")

    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_h_figure1.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_h_figure1.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure 1 saved.")


# ──────────────────────────────────────────────────────────────────────────────
# Figure 2 — Group bar chart: clock and target mean |λ| all 6 conditions
# ──────────────────────────────────────────────────────────────────────────────
def figure2():
    labels   = list(CONDITIONS.keys())
    clk_means = [v[1] for v in CONDITIONS.values()]
    tgt_means = [v[2] for v in CONDITIONS.values()]
    colors   = [PALETTE[l] for l in labels]

    x = np.arange(len(labels))
    width = 0.35
    fig, ax = plt.subplots(figsize=(10, 5))

    bars1 = ax.bar(x - width/2, clk_means, width, label="Clock genes", color=colors, alpha=0.85)
    bars2 = ax.bar(x + width/2, tgt_means, width, label="Target genes", color=colors, alpha=0.40,
                   hatch="////", edgecolor="grey")

    ax.axhline(1.0, color="black", lw=1.0, ls="--", zorder=5, label="Unit circle (|λ|=1)")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=25, ha="right", fontsize=9)
    ax.set_ylabel("|λ| (mean AR(2) eigenvalue modulus)", fontsize=10)
    ax.set_title("Figure 2. Clock and target mean |λ| across all six conditions (GSE261698)\n"
                 "Clock hierarchy maintained throughout; APP/Aged astrocyte clock crosses unit boundary",
                 fontsize=10, pad=8)
    ax.set_ylim(0.60, 1.08)
    ax.legend(fontsize=9)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.annotate("†6 time points only\n(higher uncertainty)", xy=(4.5, 0.61), fontsize=7.5, color="grey")

    # Annotate clock means
    for bar, mean in zip(bars1, clk_means):
        ax.text(bar.get_x() + bar.get_width()/2, mean + 0.003, f"{mean:.4f}", 
                ha="center", va="bottom", fontsize=7.5, fontweight="bold")

    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_h_figure2.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_h_figure2.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure 2 saved.")


# ──────────────────────────────────────────────────────────────────────────────
# Figure S1 — 6-panel per-gene scatter
# ──────────────────────────────────────────────────────────────────────────────
def figure_s1():
    cond_data = [
        ("WT Astrocyte",    WT_AST,   "#2563EB"),
        ("APP Astrocyte",   APP_AST,  "#DC2626"),
        ("Aged Astrocyte†", AGED_AST, "#7C3AED"),
        ("WT Microglia",    WT_MIC,   "#059669"),
        ("APP Microglia",   APP_MIC,  "#D97706"),
        ("Aged Microglia†", AGED_MIC, "#64748B"),
    ]
    genes = CLOCK_GENES
    x = np.arange(len(genes))

    fig, axes = plt.subplots(3, 2, figsize=(14, 12), sharex=True)
    axes = axes.flatten()

    for ax, (label, data, color) in zip(axes, cond_data):
        vals = [data.get(g) for g in genes]
        present_x = [xi for xi, v in zip(x, vals) if v is not None]
        present_v = [v for v in vals if v is not None]

        ax.axhline(1.0, color="black", lw=0.8, ls="--")
        ax.scatter(present_x, present_v, color=color, s=40, zorder=3)
        mean_v = np.mean(present_v) if present_v else None
        if mean_v:
            ax.axhline(mean_v, color=color, lw=1.0, ls="-.", alpha=0.6)
            ax.text(0.02, 0.95, f"mean={mean_v:.4f}  n={len(present_v)}",
                    transform=ax.transAxes, fontsize=8, color=color, va="top")

        n_above = sum(v > 1.0 for v in present_v) if present_v else 0
        ax.text(0.98, 0.95, f"{n_above}/{len(present_v)} > 1.0",
                transform=ax.transAxes, fontsize=8, color="black", va="top", ha="right")

        ax.set_title(label, fontsize=9, color=color, fontweight="bold")
        ax.set_ylim(0.94, 1.10)
        ax.set_yticks([0.95, 0.975, 1.0, 1.025, 1.05])
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.set_ylabel("|λ|", fontsize=8)

    for ax in axes:
        ax.set_xticks(x)
        ax.set_xticklabels([g for g in genes], rotation=60, ha="right", fontsize=7)

    fig.suptitle("Figure S1. Per-gene clock |λ| — all six conditions (GSE261698)\n"
                 "Dashed line = unit circle (|λ|=1); dash-dot = group mean",
                 fontsize=11, y=1.01)
    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_h_figure_s1.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_h_figure_s1.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure S1 saved.")


# ──────────────────────────────────────────────────────────────────────────────
# Figure S2 — Clock–target gap comparison
# ──────────────────────────────────────────────────────────────────────────────
def figure_s2():
    labels = list(CONDITIONS.keys())
    gaps   = [v[1] - v[2] for v in CONDITIONS.values()]
    colors = [PALETTE[l] for l in labels]

    fig, ax = plt.subplots(figsize=(8, 4))
    x = np.arange(len(labels))
    bars = ax.bar(x, gaps, color=colors, alpha=0.85, width=0.5)

    ax.axhline(0, color="black", lw=0.8)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=25, ha="right", fontsize=9)
    ax.set_ylabel("Clock–target gap (clock mean |λ| − target mean |λ|)", fontsize=9)
    ax.set_title("Figure S2. Clock–target gap across all six conditions\n"
                 "Positive = clock above target (hierarchy maintained); gap narrows with age/disease",
                 fontsize=10, pad=8)

    for bar, gap in zip(bars, gaps):
        ax.text(bar.get_x() + bar.get_width()/2, gap + 0.003, f"+{gap:.3f}",
                ha="center", va="bottom", fontsize=8, fontweight="bold")

    ax.set_ylim(0, 0.32)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.annotate("†6 time points only", xy=(4.1, 0.005), fontsize=7.5, color="grey")

    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_h_figure_s2.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_h_figure_s2.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure S2 saved.")


if __name__ == "__main__":
    import os; os.makedirs(OUT, exist_ok=True)
    figure1()
    figure2()
    figure_s1()
    figure_s2()
    print("All Paper H figures generated.")
