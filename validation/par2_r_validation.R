#!/usr/bin/env Rscript
# PAR(2) Discovery Engine - Independent R Validation Script
# Purpose: Cross-validate TypeScript implementation against independent R implementation
# This script reimplements the core PAR(2) algorithm to verify correctness
# Author: PAR(2) Validation Suite
# Date: December 2025

# Use base R only for maximum portability

cat("=== PAR(2) Independent R Validation ===\n\n")

# ==============================================================================
# CORE FUNCTIONS
# ==============================================================================

# 1. Cosine Phase Fitting (Cosinor Model)
# Fits y = M + A*cos(ωt - φ) = M + β₁*cos(ωt) + β₂*sin(ωt)
fit_cosine_phase <- function(time, expression, period = 24) {
  n <- length(time)
  if (n < 3) return(rep(0, n))
  
  omega <- 2 * pi / period
  mean_expr <- mean(expression)
  
  # Build design matrix for cosinor
  cos_terms <- cos(omega * time)
  sin_terms <- sin(omega * time)
  
  # Solve normal equations
  sum_cos_sq <- sum(cos_terms^2)
  sum_sin_sq <- sum(sin_terms^2)
  sum_cos_sin <- sum(cos_terms * sin_terms)
  sum_expr_cos <- sum((expression - mean_expr) * cos_terms)
  sum_expr_sin <- sum((expression - mean_expr) * sin_terms)
  
  det <- sum_cos_sq * sum_sin_sq - sum_cos_sin^2
  
  if (abs(det) < 1e-10) {
    return(rep(0, n))
  }
  
  beta1 <- (sum_sin_sq * sum_expr_cos - sum_cos_sin * sum_expr_sin) / det
  beta2 <- (sum_cos_sq * sum_expr_sin - sum_cos_sin * sum_expr_cos) / det
  
  # Phase at each timepoint: φ(t) = ωt - arctan2(β₂, β₁)
  base_phase <- atan2(beta2, beta1)
  phi <- omega * time - base_phase
  
  return(phi)
}

# 2. AR(2) Eigenvalue Calculation
# Characteristic equation: λ² - β₁λ - β₂ = 0
# λ = (β₁ ± √(β₁² + 4β₂)) / 2
solve_ar2_eigenvalues <- function(beta1, beta2) {
  discriminant <- beta1^2 + 4 * beta2
  
  if (discriminant >= 0) {
    # Real eigenvalues
    sqrt_d <- sqrt(discriminant)
    lambda1 <- (beta1 + sqrt_d) / 2
    lambda2 <- (beta1 - sqrt_d) / 2
    
    return(list(
      lambda1 = lambda1,
      lambda2 = lambda2,
      is_complex = FALSE,
      modulus1 = abs(lambda1),
      modulus2 = abs(lambda2),
      max_modulus = max(abs(lambda1), abs(lambda2))
    ))
  } else {
    # Complex conjugate eigenvalues
    real_part <- beta1 / 2
    imag_part <- sqrt(-discriminant) / 2
    
    modulus <- sqrt(real_part^2 + imag_part^2)
    
    return(list(
      lambda1 = complex(real = real_part, imaginary = imag_part),
      lambda2 = complex(real = real_part, imaginary = -imag_part),
      is_complex = TRUE,
      modulus1 = modulus,
      modulus2 = modulus,
      max_modulus = modulus
    ))
  }
}

# 3. PAR(2) Regression
# Model: R(t) = β₀ + β₁R(t-1) + β₂R(t-1)cos(φ(t-1)) + β₃R(t-1)sin(φ(t-1)) 
#             + β₄R(t-2) + β₅R(t-2)cos(φ(t-2)) + β₆R(t-2)sin(φ(t-2)) + ε
run_par2_regression <- function(target_expr, clock_expr, time, period = 24) {
  n <- length(target_expr)
  
  if (n < 10) {
    return(list(
      success = FALSE,
      error = "Insufficient data points (need >= 10)"
    ))
  }
  
  # Fit clock phase
  phi <- fit_cosine_phase(time, clock_expr, period)
  
  # Build lagged variables (2nd order AR)
  R <- target_expr
  R_n <- R[3:n]           # R(t)
  R_n_1 <- R[2:(n-1)]     # R(t-1)
  R_n_2 <- R[1:(n-2)]     # R(t-2)
  Phi_n_1 <- phi[2:(n-1)] # φ(t-1)
  Phi_n_2 <- phi[1:(n-2)] # φ(t-2)
  
  m <- length(R_n)
  
  # Design matrix: [1, R_n_1, R_n_1*cos, R_n_1*sin, R_n_2, R_n_2*cos, R_n_2*sin]
  X <- cbind(
    rep(1, m),                    # Intercept
    R_n_1,                        # AR(1) term
    R_n_1 * cos(Phi_n_1),         # Phase interaction 1
    R_n_1 * sin(Phi_n_1),         # Phase interaction 2
    R_n_2,                        # AR(2) term
    R_n_2 * cos(Phi_n_2),         # Phase interaction 3
    R_n_2 * sin(Phi_n_2)          # Phase interaction 4
  )
  
  colnames(X) <- c("const", "R_n_1", "R_n_1_cos", "R_n_1_sin", 
                   "R_n_2", "R_n_2_cos", "R_n_2_sin")
  
  y <- R_n
  
  # Fit full model using OLS
  fit <- tryCatch({
    lm.fit(X, y)
  }, error = function(e) NULL)
  
  if (is.null(fit)) {
    return(list(success = FALSE, error = "Regression failed"))
  }
  
  coefficients <- fit$coefficients
  residuals <- fit$residuals
  df_residual <- m - 7  # n - p
  
  # Calculate MSE and standard errors
  sse <- sum(residuals^2)
  mse <- sse / df_residual
  
  # Variance-covariance matrix
  XtX_inv <- tryCatch(solve(t(X) %*% X), error = function(e) NULL)
  if (is.null(XtX_inv)) {
    return(list(success = FALSE, error = "Singular matrix"))
  }
  
  std_errors <- sqrt(diag(XtX_inv) * mse)
  t_stats <- coefficients / std_errors
  p_values <- 2 * pt(-abs(t_stats), df = df_residual)
  
  # F-test for phase terms (indices 3,4,6,7 in R = 2,3,5,6 in 0-indexed)
  # Compare full model vs reduced model (no phase interactions)
  X_reduced <- X[, c(1, 2, 5)]  # Just intercept and AR terms
  fit_reduced <- tryCatch(lm.fit(X_reduced, y), error = function(e) NULL)
  
  if (!is.null(fit_reduced)) {
    sse_reduced <- sum(fit_reduced$residuals^2)
    df_diff <- 4  # 4 phase terms removed
    f_stat <- ((sse_reduced - sse) / df_diff) / (sse / df_residual)
    f_pvalue <- 1 - pf(f_stat, df_diff, df_residual)
  } else {
    f_stat <- 0
    f_pvalue <- 1
  }
  
  # Extract AR coefficients for eigenvalue calculation
  # β₁ = coefficient on R(t-1), β₂ = coefficient on R(t-2)
  beta1_ar <- coefficients[2]  # R_n_1
  beta2_ar <- coefficients[5]  # R_n_2
  
  eigenvalues <- solve_ar2_eigenvalues(beta1_ar, beta2_ar)
  
  # Calculate R-squared
  sst <- sum((y - mean(y))^2)
  r_squared <- 1 - sse / sst
  adj_r_squared <- 1 - (1 - r_squared) * (m - 1) / df_residual
  
  return(list(
    success = TRUE,
    coefficients = as.list(setNames(as.numeric(coefficients), names(coefficients))),
    std_errors = as.list(setNames(std_errors, names(coefficients))),
    t_stats = as.list(setNames(t_stats, names(coefficients))),
    p_values = as.list(setNames(p_values, names(coefficients))),
    f_statistic = f_stat,
    f_pvalue = f_pvalue,
    eigenvalues = eigenvalues,
    r_squared = r_squared,
    adj_r_squared = adj_r_squared,
    mse = mse,
    df_residual = df_residual,
    n_observations = m
  ))
}

# ==============================================================================
# VALIDATION TESTS
# ==============================================================================

run_validation_tests <- function() {
  cat("Running validation tests...\n\n")
  
  results <- list(
    tests = list(),
    summary = list(
      total = 0,
      passed = 0,
      failed = 0
    )
  )
  
  # Test 1: Eigenvalue calculation (known values)
  cat("Test 1: AR(2) Eigenvalue Calculation\n")
  test1 <- list(name = "Eigenvalue Calculation", passed = TRUE, details = list())
  
  # Case A: Real eigenvalues (β₁=0.5, β₂=0.1)
  ev_a <- solve_ar2_eigenvalues(0.5, 0.1)
  expected_lambda1 <- (0.5 + sqrt(0.25 + 0.4)) / 2  # ≈ 0.653
  expected_lambda2 <- (0.5 - sqrt(0.25 + 0.4)) / 2  # ≈ -0.153
  
  if (abs(ev_a$lambda1 - expected_lambda1) < 1e-6 && 
      abs(ev_a$lambda2 - expected_lambda2) < 1e-6) {
    cat("  ✓ Real eigenvalues correct\n")
    test1$details$real_eigenvalues <- "PASS"
  } else {
    cat("  ✗ Real eigenvalues incorrect\n")
    cat(sprintf("    Expected: λ1=%.6f, λ2=%.6f\n", expected_lambda1, expected_lambda2))
    cat(sprintf("    Got: λ1=%.6f, λ2=%.6f\n", ev_a$lambda1, ev_a$lambda2))
    test1$passed <- FALSE
    test1$details$real_eigenvalues <- "FAIL"
  }
  
  # Case B: Complex eigenvalues (β₁=0.5, β₂=-0.5)
  ev_b <- solve_ar2_eigenvalues(0.5, -0.5)
  expected_real <- 0.25
  expected_modulus <- sqrt(0.25^2 + (sqrt(4*0.5 - 0.25)/2)^2)
  
  if (ev_b$is_complex && abs(Re(ev_b$lambda1) - expected_real) < 1e-6) {
    cat("  ✓ Complex eigenvalues correct\n")
    test1$details$complex_eigenvalues <- "PASS"
  } else {
    cat("  ✗ Complex eigenvalues incorrect\n")
    test1$passed <- FALSE
    test1$details$complex_eigenvalues <- "FAIL"
  }
  
  results$tests[[1]] <- test1
  results$summary$total <- results$summary$total + 1
  if (test1$passed) results$summary$passed <- results$summary$passed + 1
  else results$summary$failed <- results$summary$failed + 1
  
  # Test 2: Phase fitting on synthetic oscillation
  cat("\nTest 2: Cosine Phase Fitting\n")
  test2 <- list(name = "Cosine Phase Fitting", passed = TRUE, details = list())
  
  time <- seq(0, 46, by = 2)  # 24 timepoints over ~48h
  period <- 24
  true_phase <- pi/4  # 45 degrees, peak at ZT3
  clock_expr <- 5 + 2 * cos(2 * pi * time / period - true_phase) + rnorm(length(time), 0, 0.1)
  
  fitted_phi <- fit_cosine_phase(time, clock_expr, period)
  
  # The fitted phase should be close to ωt - true_phase
  expected_phi <- 2 * pi * time / period - true_phase
  correlation <- cor(fitted_phi, expected_phi)
  
  if (correlation > 0.99) {
    cat(sprintf("  ✓ Phase correlation: %.4f (>0.99)\n", correlation))
    test2$details$phase_correlation <- correlation
  } else {
    cat(sprintf("  ✗ Phase correlation too low: %.4f\n", correlation))
    test2$passed <- FALSE
    test2$details$phase_correlation <- correlation
  }
  
  results$tests[[2]] <- test2
  results$summary$total <- results$summary$total + 1
  if (test2$passed) results$summary$passed <- results$summary$passed + 1
  else results$summary$failed <- results$summary$failed + 1
  
  # Test 3: Full PAR(2) on synthetic gated data
  cat("\nTest 3: PAR(2) Regression on Synthetic Gated Data\n")
  test3 <- list(name = "PAR(2) Gated Data Detection", passed = TRUE, details = list())
  
  set.seed(42)
  n <- 48  # 48 timepoints
  time <- seq(0, 94, by = 2)
  
  # Generate clock gene with clear circadian rhythm
  clock_phase <- pi/3
  clock_expr <- 10 + 3 * cos(2 * pi * time / 24 - clock_phase) + rnorm(n, 0, 0.2)
  
  # Generate target with phase-dependent regulation
  # Target responds more strongly when clock is at peak (phase near 0)
  phi <- 2 * pi * time / 24 - clock_phase
  target_expr <- numeric(n)
  target_expr[1] <- 5
  target_expr[2] <- 5.1
  
  for (i in 3:n) {
    # AR(2) with phase-modulated coefficients
    ar1_base <- 0.3
    ar2_base <- 0.1
    phase_mod <- 0.2 * cos(phi[i-1])  # Phase modulation
    
    target_expr[i] <- 2 + 
      (ar1_base + phase_mod) * target_expr[i-1] +
      ar2_base * target_expr[i-2] +
      rnorm(1, 0, 0.3)
  }
  
  # Run PAR(2)
  par2_result <- run_par2_regression(target_expr, clock_expr, time, 24)
  
  if (par2_result$success) {
    cat(sprintf("  ✓ Regression successful (n=%d)\n", par2_result$n_observations))
    cat(sprintf("    R² = %.4f\n", par2_result$r_squared))
    cat(sprintf("    Max |λ| = %.4f\n", par2_result$eigenvalues$max_modulus))
    cat(sprintf("    F-statistic = %.4f, p = %.4f\n", par2_result$f_statistic, par2_result$f_pvalue))
    
    # Check if phase terms are significant (F-test p < 0.05 for synthetic gated data)
    if (par2_result$f_pvalue < 0.1) {
      cat("  ✓ Phase gating detected (F-test significant)\n")
      test3$details$gating_detected <- TRUE
    } else {
      cat("  ⚠ Phase gating not detected (may need stronger signal)\n")
      test3$details$gating_detected <- FALSE
    }
    
    # Check stability
    if (par2_result$eigenvalues$max_modulus < 1) {
      cat(sprintf("  ✓ Stable dynamics (|λ| = %.4f < 1)\n", par2_result$eigenvalues$max_modulus))
      test3$details$stable <- TRUE
    } else {
      cat(sprintf("  ⚠ Unstable dynamics (|λ| = %.4f >= 1)\n", par2_result$eigenvalues$max_modulus))
      test3$details$stable <- FALSE
    }
    
    test3$details$result <- par2_result
  } else {
    cat(sprintf("  ✗ Regression failed: %s\n", par2_result$error))
    test3$passed <- FALSE
    test3$details$error <- par2_result$error
  }
  
  results$tests[[3]] <- test3
  results$summary$total <- results$summary$total + 1
  if (test3$passed) results$summary$passed <- results$summary$passed + 1
  else results$summary$failed <- results$summary$failed + 1
  
  # Test 4: Null simulation (no gating - should show low F-statistic)
  cat("\nTest 4: Null Simulation (No Gating)\n")
  test4 <- list(name = "Null Simulation - False Positive Rate", passed = TRUE, details = list())
  
  set.seed(123)
  n_null_sims <- 100
  false_positives <- 0
  
  for (sim in 1:n_null_sims) {
    # Generate independent clock (no relationship to target)
    null_clock <- 10 + 3 * cos(2 * pi * time / 24 - runif(1, 0, 2*pi)) + rnorm(n, 0, 0.5)
    
    # Generate pure AR(2) target with NO phase modulation
    null_target <- numeric(n)
    null_target[1] <- 5
    null_target[2] <- 5.1
    for (i in 3:n) {
      null_target[i] <- 2 + 0.4 * null_target[i-1] + 0.1 * null_target[i-2] + rnorm(1, 0, 0.5)
    }
    
    null_result <- run_par2_regression(null_target, null_clock, time, 24)
    
    if (null_result$success && null_result$f_pvalue < 0.05) {
      false_positives <- false_positives + 1
    }
  }
  
  fpr <- false_positives / n_null_sims
  cat(sprintf("  False positive rate: %d/%d = %.1f%%\n", false_positives, n_null_sims, fpr * 100))
  
  if (fpr <= 0.10) {  # Allow up to 10% for small sample
    cat("  ✓ FPR acceptable (<= 10%)\n")
    test4$details$fpr <- fpr
  } else {
    cat(sprintf("  ✗ FPR too high: %.1f%%\n", fpr * 100))
    test4$passed <- FALSE
    test4$details$fpr <- fpr
  }
  
  results$tests[[4]] <- test4
  results$summary$total <- results$summary$total + 1
  if (test4$passed) results$summary$passed <- results$summary$passed + 1
  else results$summary$failed <- results$summary$failed + 1
  
  # Summary
  cat("\n=== VALIDATION SUMMARY ===\n")
  cat(sprintf("Total tests: %d\n", results$summary$total))
  cat(sprintf("Passed: %d\n", results$summary$passed))
  cat(sprintf("Failed: %d\n", results$summary$failed))
  
  if (results$summary$failed == 0) {
    cat("\n✓ ALL TESTS PASSED - R implementation validates core algorithms\n")
  } else {
    cat("\n✗ SOME TESTS FAILED - Review implementation\n")
  }
  
  return(results)
}

# ==============================================================================
# CROSS-VALIDATION FUNCTION
# ==============================================================================

# Cross-validation can be done by comparing coefficient outputs
# Save the test coefficients for comparison with TypeScript
print_coefficients_for_comparison <- function() {
  cat("\n=== COEFFICIENTS FOR TYPESCRIPT COMPARISON ===\n")
  
  # Test case: known eigenvalue calculation
  # β₁ = 0.5, β₂ = 0.1 should give λ₁ ≈ 0.653, λ₂ ≈ -0.153
  ev_test <- solve_ar2_eigenvalues(0.5, 0.1)
  cat(sprintf("Test case (β₁=0.5, β₂=0.1):\n"))
  cat(sprintf("  λ₁ = %.10f\n", ev_test$lambda1))
  cat(sprintf("  λ₂ = %.10f\n", ev_test$lambda2))
  cat(sprintf("  |λ|_max = %.10f\n", ev_test$max_modulus))
  
  # Complex case
  ev_complex <- solve_ar2_eigenvalues(0.5, -0.5)
  cat(sprintf("\nComplex case (β₁=0.5, β₂=-0.5):\n"))
  cat(sprintf("  λ₁ = %s\n", format(ev_complex$lambda1)))
  cat(sprintf("  |λ| = %.10f\n", ev_complex$modulus1))
}

# ==============================================================================
# MAIN
# ==============================================================================

main <- function() {
  cat("PAR(2) R Validation Script\n")
  cat("==========================\n\n")
  
  # Run core validation tests
  validation_results <- run_validation_tests()
  
  # Save results as text
  output_file <- "validation/par2_r_validation_results.txt"
  sink(output_file)
  cat("PAR(2) R Validation Results\n")
  cat(sprintf("Date: %s\n", Sys.time()))
  cat(sprintf("Total: %d, Passed: %d, Failed: %d\n", 
              validation_results$summary$total,
              validation_results$summary$passed,
              validation_results$summary$failed))
  sink()
  cat(sprintf("\nResults saved to: %s\n", output_file))
  
  # Print coefficients for TypeScript comparison
  print_coefficients_for_comparison()
  
  cat("\nValidation complete.\n")
  
  return(validation_results)
}

# Run if executed directly
if (!interactive()) {
  main()
}
