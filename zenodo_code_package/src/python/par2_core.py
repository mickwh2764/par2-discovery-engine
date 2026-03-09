"""
PAR(2) Discovery Engine - Core Algorithm Implementation

Phase-Amplitude-Relationship (2) Analysis for Circadian Gene Networks

Copyright (c) 2025 Michael Whiteside
Licensed under Apache License 2.0

PATENT NOTICE: The PAR(2) methodology is subject to a pending UK patent.
Commercial use requires a separate license. Contact: mickwh@msn.com
"""

import numpy as np
from scipy import stats
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass

@dataclass
class GeneData:
    """Gene expression time series data"""
    time: np.ndarray
    expression: np.ndarray

@dataclass
class PAR2Result:
    """Results from PAR(2) analysis"""
    significant: bool
    pValue: float
    qValue: Optional[float]
    significantTerms: List[str]
    coefficients: Dict[str, float]
    nTimepoints: int

@dataclass
class BatchResult:
    """Results from batch PAR(2) analysis with FDR correction"""
    results: List[PAR2Result]
    significantCount: int
    significantCountAfterFDR: int


def benjamini_hochberg(p_values: np.ndarray, alpha: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
    """
    Benjamini-Hochberg FDR correction
    
    Args:
        p_values: Array of p-values
        alpha: Significance threshold
        
    Returns:
        Tuple of (q_values, significant boolean array)
    """
    n = len(p_values)
    if n == 0:
        return np.array([]), np.array([])
    
    sorted_indices = np.argsort(p_values)
    sorted_p = p_values[sorted_indices]
    
    q_values = np.ones(n)
    min_q = 1.0
    
    for rank in range(n, 0, -1):
        idx = sorted_indices[rank - 1]
        q = min(min_q, sorted_p[rank - 1] * n / rank)
        q_values[idx] = min(q, 1.0)
        min_q = q_values[idx]
    
    significant = q_values < alpha
    return q_values, significant


def fit_cosine_phase(time: np.ndarray, expression: np.ndarray, period: float = 24.0) -> np.ndarray:
    """
    Fit cosine phase to clock gene expression using linear least squares
    
    Args:
        time: Time points
        expression: Expression values
        period: Circadian period in hours
        
    Returns:
        Array of phase values at each timepoint
    """
    n = len(time)
    omega = 2 * np.pi / period
    
    if n < 4:
        return (omega * time) % (2 * np.pi)
    
    mean_expr = np.mean(expression)
    centered_expr = expression - mean_expr
    
    cos_vals = np.cos(omega * time)
    sin_vals = np.sin(omega * time)
    
    sum_cos_sq = np.sum(cos_vals ** 2)
    sum_sin_sq = np.sum(sin_vals ** 2)
    sum_cos_sin = np.sum(cos_vals * sin_vals)
    sum_expr_cos = np.sum(centered_expr * cos_vals)
    sum_expr_sin = np.sum(centered_expr * sin_vals)
    
    det = sum_cos_sq * sum_sin_sq - sum_cos_sin ** 2
    
    if abs(det) > 1e-10:
        a = (sum_sin_sq * sum_expr_cos - sum_cos_sin * sum_expr_sin) / det
        b = (sum_cos_sq * sum_expr_sin - sum_cos_sin * sum_expr_cos) / det
        phase_offset = np.arctan2(b, a)
    else:
        phase_offset = 0
    
    raw_phase = omega * time - phase_offset
    return np.mod(np.mod(raw_phase, 2 * np.pi) + 2 * np.pi, 2 * np.pi)


def run_par2_analysis(
    target_data: Dict[str, Any],
    clock_data: Dict[str, Any],
    period: float = 24.0,
    significance_threshold: float = 0.05
) -> Dict[str, Any]:
    """
    Run PAR(2) analysis on a single gene pair
    
    Tests whether clock gene phase modulates target gene AR dynamics
    
    Args:
        target_data: Dict with 'time' and 'expression' arrays
        clock_data: Dict with 'time' and 'expression' arrays
        period: Circadian period in hours
        significance_threshold: P-value threshold for significance
        
    Returns:
        Dict with analysis results
    """
    target_time = np.array(target_data['time'])
    target_expr = np.array(target_data['expression'])
    clock_time = np.array(clock_data['time'])
    clock_expr = np.array(clock_data['expression'])
    
    if len(target_time) != len(clock_time):
        raise ValueError("Target and clock data must have the same length")
    
    n_timepoints = len(target_time)
    
    if n_timepoints < 10:
        return {
            'significant': False,
            'pValue': 1.0,
            'significantTerms': [],
            'coefficients': {},
            'nTimepoints': n_timepoints
        }
    
    # Fit clock gene phase
    phi = fit_cosine_phase(clock_time, clock_expr, period)
    
    # Build AR(2) design with phase interactions
    R = target_expr
    R_n = R[2:]
    R_n_1 = R[1:-1]
    R_n_2 = R[:-2]
    Phi_n_1 = phi[1:-1]
    Phi_n_2 = phi[:-2]
    
    n = len(R_n)
    
    # Design matrix: [intercept, R_n_1, R_n_1*cos, R_n_1*sin, R_n_2, R_n_2*cos, R_n_2*sin]
    X = np.column_stack([
        np.ones(n),
        R_n_1,
        R_n_1 * np.cos(Phi_n_1),
        R_n_1 * np.sin(Phi_n_1),
        R_n_2,
        R_n_2 * np.cos(Phi_n_2),
        R_n_2 * np.sin(Phi_n_2)
    ])
    
    # Fit regression
    try:
        # Add small regularization for numerical stability
        XtX = X.T @ X + 1e-10 * np.eye(X.shape[1])
        XtX_inv = np.linalg.inv(XtX)
        coefficients = XtX_inv @ X.T @ R_n
        
        # Calculate residuals and statistics
        predictions = X @ coefficients
        residuals = R_n - predictions
        sse = np.sum(residuals ** 2)
        df = n - X.shape[1]
        mse = sse / df if df > 0 else 0
        
        # Standard errors and p-values
        se = np.sqrt(np.maximum(0, mse * np.diag(XtX_inv)))
        t_stats = np.where(se > 0, np.abs(coefficients / se), 0)
        p_values = 2 * (1 - stats.t.cdf(t_stats, df))
        
    except np.linalg.LinAlgError:
        return {
            'significant': False,
            'pValue': 1.0,
            'significantTerms': [],
            'coefficients': {},
            'nTimepoints': n_timepoints
        }
    
    coeff_names = ['const', 'R_n_1', 'R_n_1_cos', 'R_n_1_sin', 'R_n_2', 'R_n_2_cos', 'R_n_2_sin']
    periodic_term_indices = [2, 3, 5, 6]
    periodic_term_names = ['R_n_1_cos', 'R_n_1_sin', 'R_n_2_cos', 'R_n_2_sin']
    
    significant_terms = []
    min_p_value = 1.0
    
    for idx, name in zip(periodic_term_indices, periodic_term_names):
        p_val = p_values[idx]
        if p_val < min_p_value:
            min_p_value = p_val
        if p_val < significance_threshold:
            significant_terms.append(name)
    
    # Apply within-pair Bonferroni correction (4 interaction terms)
    corrected_p_value = min(min_p_value * 4, 1.0)
    
    coeff_dict = {name: float(coefficients[i]) for i, name in enumerate(coeff_names)}
    
    return {
        'significant': corrected_p_value < significance_threshold,
        'pValue': float(corrected_p_value),
        'significantTerms': significant_terms,
        'coefficients': coeff_dict,
        'nTimepoints': n_timepoints
    }


def run_batch_analysis(
    analyses: List[Dict[str, Any]],
    period: float = 24.0,
    significance_threshold: float = 0.05
) -> Dict[str, Any]:
    """
    Run batch PAR(2) analysis with FDR correction
    
    Args:
        analyses: List of dicts with 'targetData', 'clockData', and 'id'
        period: Circadian period in hours
        significance_threshold: P-value threshold
        
    Returns:
        Dict with batch results and FDR correction info
    """
    results = []
    p_values = []
    
    for analysis in analyses:
        result = run_par2_analysis(
            analysis['targetData'],
            analysis['clockData'],
            period,
            significance_threshold
        )
        results.append(result)
        p_values.append(result['pValue'])
    
    p_values = np.array(p_values)
    q_values, significant = benjamini_hochberg(p_values, significance_threshold)
    
    for i, result in enumerate(results):
        result['qValue'] = float(q_values[i])
        result['significant'] = bool(significant[i])
    
    return {
        'results': results,
        'fdrCorrection': {
            'method': 'Benjamini-Hochberg',
            'significantCount': int(np.sum(p_values < significance_threshold)),
            'significantCountAfterFDR': int(np.sum(significant))
        }
    }


def calculate_eigenperiod(
    ar1_coeff: float,
    ar2_coeff: float,
    sampling_interval: float = 4.0
) -> Dict[str, float]:
    """
    Calculate eigenperiod from AR coefficients
    
    Args:
        ar1_coeff: AR(1) coefficient
        ar2_coeff: AR(2) coefficient
        sampling_interval: Time between samples in hours
        
    Returns:
        Dict with eigenperiod, stability, and damping ratio
    """
    discriminant = ar1_coeff ** 2 + 4 * ar2_coeff
    
    if discriminant >= 0:
        # Real roots - no oscillation
        r1 = (ar1_coeff + np.sqrt(discriminant)) / 2
        r2 = (ar1_coeff - np.sqrt(discriminant)) / 2
        return {
            'eigenperiod': float('inf'),
            'stable': abs(r1) < 1 and abs(r2) < 1,
            'dampingRatio': 1.0
        }
    
    # Complex conjugate roots - oscillatory
    real_part = ar1_coeff / 2
    imag_part = np.sqrt(-discriminant) / 2
    modulus = np.sqrt(real_part ** 2 + imag_part ** 2)
    angle = np.arctan2(imag_part, real_part)
    
    eigenperiod = (2 * np.pi / abs(angle)) * sampling_interval if angle != 0 else float('inf')
    
    return {
        'eigenperiod': eigenperiod,
        'stable': modulus < 1,
        'dampingRatio': modulus
    }


if __name__ == "__main__":
    # Example usage
    target_data = {
        'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
        'expression': [1.2, 1.5, 2.1, 1.8, 1.3, 1.1, 1.3, 1.6, 2.0, 1.7]
    }
    
    clock_data = {
        'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
        'expression': [0.5, 1.2, 1.8, 1.5, 0.8, 0.3, 0.5, 1.3, 1.9, 1.4]
    }
    
    result = run_par2_analysis(target_data, clock_data, period=24)
    
    print("PAR(2) Analysis Result:")
    print(f"  Significant: {result['significant']}")
    print(f"  P-value: {result['pValue']:.4f}")
    print(f"  Significant terms: {result['significantTerms']}")
    print(f"  Timepoints: {result['nTimepoints']}")
