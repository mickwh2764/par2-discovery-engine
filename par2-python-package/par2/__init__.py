"""PAR(2): AR(2) eigenvalue analysis for gene expression time series."""

__version__ = "1.1.0"

from .core import fit_ar2, fit_ar2_batch, classify_dynamics
from .io import load_expression_matrix, save_results
from .metrics import half_life, eigenperiod
from .hierarchy import (
    discover_hierarchy,
    gearbox_gap,
    classify_gene_layer,
    CORE_CLOCK_GENES,
    KNOWN_TARGET_GENES,
)

__all__ = [
    "fit_ar2",
    "fit_ar2_batch",
    "classify_dynamics",
    "load_expression_matrix",
    "save_results",
    "half_life",
    "eigenperiod",
    "discover_hierarchy",
    "gearbox_gap",
    "classify_gene_layer",
    "CORE_CLOCK_GENES",
    "KNOWN_TARGET_GENES",
]
