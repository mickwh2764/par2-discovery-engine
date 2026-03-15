"""PAR(2): AR(2) eigenvalue analysis for gene expression time series."""

__version__ = "1.0.0"

from .core import fit_ar2, fit_ar2_batch, classify_dynamics
from .io import load_expression_matrix, save_results
from .metrics import half_life, eigenperiod

__all__ = [
    "fit_ar2",
    "fit_ar2_batch",
    "classify_dynamics",
    "load_expression_matrix",
    "save_results",
    "half_life",
    "eigenperiod",
]
