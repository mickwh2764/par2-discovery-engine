"""
Paper N — Supplementary figure: GSE221103 neuroblastoma clock hierarchy
Generates Figure S-NB: clock and target mean |λ| across 4 conditions (SHEP/SKNAS × MYC-ON/OFF)

Run: python manuscripts/scripts/generate_paper_n_nb_figures.py
Output: manuscripts/figures/generated/paper_n_figure_s_nb*.pdf + *.png
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

OUT = "manuscripts/figures/generated"

# ──────────────────────────────────────────────────────────────────────────────
# Data (from AR(2) analysis of GSE221103, Altman/Dang 2023)
# ──────────────────────────────────────────────────────────────────────────────

CONDITIONS = {
    "SHEP\nMYC-OFF": {"clock": 0.9166, "target": 0.7254, "cell": "SHEP", "myc": "OFF"},
    "SHEP\nMYC-ON":  {"clock": 0.9595, "target": 0.7404, "cell": "SHEP", "myc": "ON"},
    "SKNAS\nMYC-OFF": {"clock": 0.8809, "target": 0.7003, "cell": "SKNAS", "myc": "OFF"},
    "SKNAS\nMYC-ON":  {"clock": 0.9288, "target": 0.6902, "cell": "SKNAS", "myc": "ON"},
}

CLOCK_GENES = [
    "TIMELESS","FBXL3","CSNK1E","ARNTL","CLOCK","TIPIN","NPAS2","CSNK1D",
    "ARNTL2","NFIL3","RORA","DBP","NR1D2","NR1D1","PER1","CRY1",
    "RORB","CRY2","PER3","PER2",
]

PER_GENE = {
    "SHEP\nMYC-OFF": {
        "TIMELESS": 1.0170, "FBXL3": 1.0021, "CSNK1E": 0.9975, "ARNTL": 0.9969,
        "CLOCK": 0.9965, "TIPIN": 0.9905, "NPAS2": 0.9891, "CSNK1D": 0.9889,
        "ARNTL2": 0.9875, "NFIL3": 0.9873, "RORA": 0.9739, "DBP": 0.9729,
        "NR1D2": 0.9691, "NR1D1": 0.9650, "PER1": 0.9501, "CRY1": 0.9228,
        "RORB": 0.9169, "CRY2": 0.8947, "PER3": 0.8840, "PER2": 0.8485,
    },
    "SHEP\nMYC-ON": {
        "TIMELESS": 0.9414, "FBXL3": 0.9721, "CSNK1E": 1.0554, "ARNTL": 1.0244,
        "CLOCK": 0.9810, "TIPIN": 0.9852, "NPAS2": None, "CSNK1D": 0.9908,
        "ARNTL2": 1.0059, "NFIL3": 1.0216, "RORA": 1.0661, "DBP": 1.0038,
        "NR1D2": 0.9836, "NR1D1": 1.0184, "PER1": 0.9830, "CRY1": 1.0214,
        "RORB": 1.0877, "CRY2": 0.9596, "PER3": 0.9845, "PER2": 0.9043,
    },
    "SKNAS\nMYC-OFF": {
        "TIMELESS": 0.9381, "FBXL3": 0.9686, "CSNK1E": 0.9326, "ARNTL": 0.9198,
        "CLOCK": 0.8808, "TIPIN": 0.9836, "NPAS2": 0.9060, "CSNK1D": 0.9336,
        "ARNTL2": 0.9565, "NFIL3": 0.9552, "RORA": 0.9381, "DBP": 0.9935,
        "NR1D2": 0.9208, "NR1D1": 0.9022, "PER1": 0.8056, "CRY1": 0.9195,
        "RORB": 0.9178, "CRY2": 0.8448, "PER3": 0.8374, "PER2": None,
    },
    "SKNAS\nMYC-ON": {
        "TIMELESS": 0.9349, "FBXL3": 0.9564, "CSNK1E": 0.9326, "ARNTL": 0.9044,
        "CLOCK": None, "TIPIN": 0.9688, "NPAS2": 0.9415, "CSNK1D": 0.9458,
        "ARNTL2": None, "NFIL3": 0.9426, "RORA": 0.9642, "DBP": 1.0586,
        "NR1D2": 0.9261, "NR1D1": 0.9392, "PER1": 0.8856, "CRY1": 0.9688,
        "RORB": None, "CRY2": 0.8847, "PER3": 0.9108, "PER2": 0.8841,
    },
}

COLORS = {
    "SHEP\nMYC-OFF": "#93C5FD",
    "SHEP\nMYC-ON":  "#1D4ED8",
    "SKNAS\nMYC-OFF": "#86EFAC",
    "SKNAS\nMYC-ON":  "#15803D",
}


# ──────────────────────────────────────────────────────────────────────────────
# Figure S-NB-1 — Group bar chart: clock and target mean |λ|
# ──────────────────────────────────────────────────────────────────────────────
def figure_snb1():
    labels = list(CONDITIONS.keys())
    clk = [CONDITIONS[l]["clock"] for l in labels]
    tgt = [CONDITIONS[l]["target"] for l in labels]
    colors = [COLORS[l] for l in labels]
    x = np.arange(len(labels))
    w = 0.35

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Left panel: grouped bar
    ax = axes[0]
    b1 = ax.bar(x - w/2, clk, w, color=colors, alpha=0.9, label="Clock genes")
    b2 = ax.bar(x + w/2, tgt, w, color=colors, alpha=0.40, hatch="////",
                edgecolor="grey", label="Target genes")
    ax.axhline(1.0, color="black", lw=0.8, ls="--", label="|λ|=1.0")
    ax.set_xticks(x); ax.set_xticklabels(labels, fontsize=9)
    ax.set_ylabel("|λ| (mean AR(2) eigenvalue modulus)", fontsize=9)
    ax.set_ylim(0.55, 1.05)
    ax.set_title("Clock vs Target mean |λ|\nGSE221103 (N=14 per condition)", fontsize=10)
    ax.legend(fontsize=8)
    ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)
    for bar, val in zip(b1, clk):
        ax.text(bar.get_x()+bar.get_width()/2, val+0.003, f"{val:.4f}",
                ha="center", fontsize=8, fontweight="bold")

    # Right panel: clock-target gap
    ax2 = axes[1]
    gaps = [c - t for c, t in zip(clk, tgt)]
    ax2.bar(x, gaps, color=colors, alpha=0.85, width=0.5)
    ax2.set_xticks(x); ax2.set_xticklabels(labels, fontsize=9)
    ax2.set_ylabel("Clock–target gap (clock − target)", fontsize=9)
    ax2.set_ylim(0, 0.30)
    ax2.set_title("MYC-ON widens the clock–target gap\nin both cell lines", fontsize=10)
    ax2.spines["top"].set_visible(False); ax2.spines["right"].set_visible(False)
    for xi, gap, lbl in zip(x, gaps, labels):
        delta_str = f"+{gap:.3f}"
        ax2.text(xi, gap + 0.003, delta_str, ha="center", fontsize=9, fontweight="bold")

    # Arrows for MYC effect
    for i, (off_i, on_i) in enumerate([(0,1), (2,3)]):
        ax2.annotate("", xy=(on_i, gaps[on_i]+0.015), xytext=(off_i, gaps[off_i]+0.015),
                     arrowprops=dict(arrowstyle="->", color="black", lw=1.0))

    fig.suptitle("Figure S-NB-1. Clock–target AR(2) hierarchy in GSE221103 (Altman/Dang 2023)\n"
                 "Neuroblastoma N-MYC-ER inducible system — SHEP and SKNAS cell lines",
                 fontsize=10, y=1.02)
    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_n_figure_s_nb1.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_n_figure_s_nb1.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure S-NB-1 saved.")


# ──────────────────────────────────────────────────────────────────────────────
# Figure S-NB-2 — Per-gene scatter: MYC-OFF vs MYC-ON for each cell line
# ──────────────────────────────────────────────────────────────────────────────
def figure_snb2():
    genes = CLOCK_GENES
    x = np.arange(len(genes))
    fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

    pairs = [
        ("SHEP\nMYC-OFF", "SHEP\nMYC-ON", "SHEP", axes[0], "#93C5FD", "#1D4ED8"),
        ("SKNAS\nMYC-OFF", "SKNAS\nMYC-ON", "SKNAS", axes[1], "#86EFAC", "#15803D"),
    ]

    for off_key, on_key, cell, ax, c_off, c_on in pairs:
        off_v = [PER_GENE[off_key].get(g) for g in genes]
        on_v  = [PER_GENE[on_key].get(g)  for g in genes]

        ax.axhline(1.0, color="black", lw=0.8, ls="--", zorder=0)
        for i, (o, n) in enumerate(zip(off_v, on_v)):
            if o is not None and n is not None:
                ax.annotate("", xy=(x[i]+0.12, n), xytext=(x[i]-0.12, o),
                            arrowprops=dict(arrowstyle="->", color="grey", lw=0.5))

        x_off = [xi for xi, v in zip(x, off_v) if v is not None]
        v_off = [v for v in off_v if v is not None]
        x_on  = [xi for xi, v in zip(x, on_v) if v is not None]
        v_on  = [v for v in on_v  if v is not None]

        ax.scatter(x_off, v_off, color=c_off, s=50, zorder=3, label=f"{cell} MYC-OFF")
        ax.scatter(x_on,  v_on,  color=c_on,  s=50, marker="^", zorder=3, label=f"{cell} MYC-ON")

        mean_off = np.mean(v_off); mean_on = np.mean(v_on)
        ax.axhline(mean_off, color=c_off, lw=1.0, ls="-.", alpha=0.7)
        ax.axhline(mean_on,  color=c_on,  lw=1.0, ls="-.", alpha=0.7)
        ax.text(0.01, 0.95, f"MYC-OFF mean: {mean_off:.4f}", transform=ax.transAxes,
                fontsize=8, color=c_off, va="top")
        ax.text(0.01, 0.86, f"MYC-ON  mean: {mean_on:.4f}", transform=ax.transAxes,
                fontsize=8, color=c_on, va="top")
        ax.text(0.99, 0.95, f"Δ = +{mean_on-mean_off:.4f}", transform=ax.transAxes,
                fontsize=8.5, color="black", va="top", ha="right", fontweight="bold")

        ax.set_ylabel("|λ|", fontsize=9)
        ax.set_ylim(0.82, 1.12)
        ax.legend(fontsize=8, loc="lower right")
        ax.set_title(f"{cell} — MYC-OFF vs MYC-ON clock gene |λ|", fontsize=10)
        ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)

    axes[1].set_xticks(x)
    axes[1].set_xticklabels(genes, rotation=45, ha="right", fontsize=8)

    fig.suptitle("Figure S-NB-2. Per-gene clock |λ|: MYC-OFF → MYC-ON shift\n"
                 "GSE221103 (Altman/Dang 2023, PubMed 37639465). Arrows show direction of MYC effect.",
                 fontsize=10, y=1.01)
    fig.tight_layout()
    fig.savefig(f"{OUT}/paper_n_figure_s_nb2.pdf", dpi=300, bbox_inches="tight")
    fig.savefig(f"{OUT}/paper_n_figure_s_nb2.png", dpi=300, bbox_inches="tight")
    plt.close(fig)
    print("Figure S-NB-2 saved.")


if __name__ == "__main__":
    import os; os.makedirs(OUT, exist_ok=True)
    figure_snb1()
    figure_snb2()
    print("All Paper N NB figures generated.")
