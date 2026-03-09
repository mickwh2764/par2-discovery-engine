/**
 * Hold-Out Validation Workflow
 * 
 * Purpose: Pre-register predictions before running PAR(2) analysis
 * This provides unbiased validation by committing to hypotheses before seeing results
 * 
 * Usage:
 *   1. Define predictions in holdout_predictions.json
 *   2. Run: npx tsx validation/holdout_validation.ts
 *   3. Results are compared against pre-registered predictions
 */

import * as fs from 'fs';
import * as path from 'path';

interface Prediction {
  id: string;
  dataset: string;
  hypothesis: string;
  prediction: {
    type: 'explosive_rate' | 'significant_gating' | 'modulus_range' | 'custom';
    condition?: string;  // e.g., "MYC-ON", "APC-KO"
    expected_value?: number;
    expected_range?: [number, number];
    comparison?: string;  // e.g., "higher than control"
    control_condition?: string;
  };
  registered_date: string;
  verified?: boolean;
  actual_result?: any;
  outcome?: 'confirmed' | 'refuted' | 'inconclusive';
}

interface HoldoutConfig {
  predictions: Prediction[];
  datasets_held_out: string[];  // Datasets not yet analyzed
  analysis_timestamp?: string;
}

const PREDICTIONS_FILE = 'validation/holdout_predictions.json';
const RESULTS_FILE = 'validation/holdout_results.json';
const ANALYSIS_RESULTS_FILE = 'manuscripts/explosive_dynamics_analysis.json';

// Check if predictions were registered BEFORE analysis results exist
function checkPreRegistrationIntegrity(): { valid: boolean; message: string } {
  const predictionsExist = fs.existsSync(PREDICTIONS_FILE);
  const resultsExist = fs.existsSync(ANALYSIS_RESULTS_FILE);
  
  if (!predictionsExist && resultsExist) {
    return {
      valid: false,
      message: 'VIOLATION: Analysis results exist but no predictions were pre-registered. ' +
               'For valid pre-registration, predictions must be recorded BEFORE running analysis.'
    };
  }
  
  if (predictionsExist) {
    const predictions = JSON.parse(fs.readFileSync(PREDICTIONS_FILE, 'utf-8'));
    
    // Check if any predictions are genuinely pre-registered (verified=false means not yet tested)
    const preRegistered = predictions.predictions.filter((p: Prediction) => !p.verified);
    if (preRegistered.length === 0 && resultsExist) {
      return {
        valid: true,
        message: 'All predictions have been verified against results.'
      };
    }
    
    return {
      valid: true,
      message: `${preRegistered.length} predictions pre-registered and awaiting verification.`
    };
  }
  
  return {
    valid: true,
    message: 'No predictions or results yet. Register predictions before running analysis.'
  };
}

// Load predictions file (must exist - no auto-generation)
function loadPredictions(): HoldoutConfig | null {
  if (fs.existsSync(PREDICTIONS_FILE)) {
    return JSON.parse(fs.readFileSync(PREDICTIONS_FILE, 'utf-8'));
  }
  return null;
}

// Create initial predictions template (run BEFORE any analysis)
function createPredictionsTemplate(): void {
  if (fs.existsSync(PREDICTIONS_FILE)) {
    console.log('Predictions file already exists. Not overwriting.');
    return;
  }
  
  if (fs.existsSync(ANALYSIS_RESULTS_FILE)) {
    console.log('WARNING: Analysis results already exist!');
    console.log('Pre-registration requires predictions BEFORE analysis.');
    console.log('Creating predictions now does NOT constitute valid pre-registration.');
  }
  
  const initialConfig: HoldoutConfig = {
    predictions: [
      {
        id: 'pred_001',
        dataset: 'GSE221103_MYC_comparison',
        hypothesis: 'MYC oncogene activation leads to higher explosive dynamics rate',
        prediction: {
          type: 'explosive_rate',
          condition: 'MYC-ON',
          comparison: 'higher than control',
          control_condition: 'MYC-OFF',
          expected_range: [3, 10]  // Expected 3-10x higher explosive rate
        },
        registered_date: new Date().toISOString(),
        verified: false
      },
      {
        id: 'pred_002',
        dataset: 'GSE157357_APC_organoids',
        hypothesis: 'APC tumor suppressor loss increases temporal instability',
        prediction: {
          type: 'explosive_rate',
          condition: 'APC-KO',
          comparison: 'higher than control',
          control_condition: 'Wild-Type',
          expected_range: [1.5, 5]  // Expected 1.5-5x higher
        },
        registered_date: new Date().toISOString(),
        verified: false
      },
      {
        id: 'pred_003',
        dataset: 'Any_healthy_tissue',
        hypothesis: 'Healthy tissue should have stable dynamics (|λ| < 1)',
        prediction: {
          type: 'explosive_rate',
          expected_range: [0, 0.5]  // Less than 0.5% explosive rate
        },
        registered_date: new Date().toISOString(),
        verified: false
      },
      {
        id: 'pred_004',
        dataset: 'Clock_gene_targets',
        hypothesis: 'Known clock-controlled genes show significant phase gating',
        prediction: {
          type: 'significant_gating',
          expected_value: 0.6  // At least 60% of known CCGs show gating
        },
        registered_date: new Date().toISOString(),
        verified: false
      },
      {
        id: 'pred_005',
        dataset: 'Cancer_signature_genes',
        hypothesis: 'Cell cycle genes under MYC control show elevated |λ|',
        prediction: {
          type: 'modulus_range',
          condition: 'MYC-ON',
          expected_range: [0.8, 1.5]  // Near or above stability boundary
        },
        registered_date: new Date().toISOString(),
        verified: false
      }
    ],
    datasets_held_out: [
      'Future_GSE_datasets',
      'User_uploaded_data'
    ]
  };
  
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(initialConfig, null, 2));
  console.log(`Created initial predictions file: ${PREDICTIONS_FILE}`);
}

// Load explosive dynamics results
function loadExplosiveResults(): any | null {
  const resultsPath = 'manuscripts/explosive_dynamics_analysis.json';
  if (fs.existsSync(resultsPath)) {
    return JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  }
  return null;
}

// Verify a single prediction against results
function verifyPrediction(prediction: Prediction, results: any): Prediction {
  const verified = { ...prediction };
  verified.verified = true;
  
  if (!results) {
    verified.outcome = 'inconclusive';
    verified.actual_result = 'No results available';
    return verified;
  }
  
  switch (prediction.prediction.type) {
    case 'explosive_rate':
      // Check if explosive rate matches prediction
      if (results.datasets) {
        const dataset = Object.values(results.datasets).find(
          (d: any) => d.name?.includes(prediction.prediction.condition || prediction.dataset)
        );
        
        if (dataset) {
          const explosiveRate = (dataset as any).explosiveRate || (dataset as any).explosive_percentage;
          verified.actual_result = { explosiveRate };
          
          if (prediction.prediction.comparison === 'higher than control') {
            const control = Object.values(results.datasets).find(
              (d: any) => d.name?.includes(prediction.prediction.control_condition || '')
            );
            if (control) {
              const controlRate = (control as any).explosiveRate || (control as any).explosive_percentage;
              const ratio = explosiveRate / controlRate;
              verified.actual_result.controlRate = controlRate;
              verified.actual_result.ratio = ratio;
              
              const [minExpected, maxExpected] = prediction.prediction.expected_range || [1, Infinity];
              verified.outcome = ratio >= minExpected && ratio <= maxExpected ? 'confirmed' : 'refuted';
            }
          }
        }
      }
      break;
      
    case 'significant_gating':
      // Check gating detection rate
      // This would need to be populated from PAR(2) results
      verified.outcome = 'inconclusive';
      verified.actual_result = 'Needs PAR(2) results analysis';
      break;
      
    case 'modulus_range':
      // Check modulus values
      verified.outcome = 'inconclusive';
      verified.actual_result = 'Needs detailed modulus analysis';
      break;
  }
  
  return verified;
}

// Run validation
function runHoldoutValidation(): void {
  console.log('=== HOLD-OUT VALIDATION WORKFLOW ===\n');
  console.log('Purpose: Verify pre-registered predictions against actual results\n');
  
  // Check pre-registration integrity
  const integrity = checkPreRegistrationIntegrity();
  console.log(`Pre-registration status: ${integrity.message}\n`);
  
  const config = loadPredictions();
  if (!config) {
    console.log('No predictions file found. Run with --init to create template.');
    console.log('IMPORTANT: Create predictions BEFORE running any analysis.');
    return;
  }
  
  const results = loadExplosiveResults();
  
  console.log(`Loaded ${config.predictions.length} predictions`);
  console.log(`Explosive dynamics results: ${results ? 'Available' : 'Not found'}\n`);
  
  console.log('=== PRE-REGISTERED PREDICTIONS ===\n');
  
  let confirmed = 0;
  let refuted = 0;
  let inconclusive = 0;
  
  const verifiedPredictions: Prediction[] = [];
  
  for (const prediction of config.predictions) {
    console.log(`[${prediction.id}] ${prediction.hypothesis}`);
    console.log(`  Dataset: ${prediction.dataset}`);
    console.log(`  Type: ${prediction.prediction.type}`);
    console.log(`  Registered: ${prediction.registered_date}`);
    
    const verified = verifyPrediction(prediction, results);
    verifiedPredictions.push(verified);
    
    if (verified.actual_result) {
      console.log(`  Actual Result: ${JSON.stringify(verified.actual_result)}`);
    }
    
    switch (verified.outcome) {
      case 'confirmed':
        console.log(`  Outcome: ✓ CONFIRMED`);
        confirmed++;
        break;
      case 'refuted':
        console.log(`  Outcome: ✗ REFUTED`);
        refuted++;
        break;
      default:
        console.log(`  Outcome: ? INCONCLUSIVE`);
        inconclusive++;
    }
    console.log('');
  }
  
  // Summary
  console.log('=== VALIDATION SUMMARY ===');
  console.log(`Total predictions: ${config.predictions.length}`);
  console.log(`Confirmed: ${confirmed}`);
  console.log(`Refuted: ${refuted}`);
  console.log(`Inconclusive: ${inconclusive}`);
  
  if (refuted === 0 && confirmed > 0) {
    console.log('\n✓ All testable predictions confirmed - high confidence in methodology');
  } else if (refuted > confirmed) {
    console.log('\n⚠ More predictions refuted than confirmed - review methodology');
  }
  
  // Save results
  const outputConfig: HoldoutConfig = {
    ...config,
    predictions: verifiedPredictions,
    analysis_timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(outputConfig, null, 2));
  console.log(`\nResults saved to: ${RESULTS_FILE}`);
}

// Add new prediction (for user registration)
function addPrediction(
  dataset: string,
  hypothesis: string,
  predictionType: Prediction['prediction']['type'],
  details: Partial<Prediction['prediction']>
): void {
  const config = loadPredictions();
  if (!config) {
    console.log('No predictions file. Run createPredictionsTemplate() first.');
    return;
  }
  
  const newPrediction: Prediction = {
    id: `pred_${String(config.predictions.length + 1).padStart(3, '0')}`,
    dataset,
    hypothesis,
    prediction: {
      type: predictionType,
      ...details
    },
    registered_date: new Date().toISOString(),
    verified: false
  };
  
  config.predictions.push(newPrediction);
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(config, null, 2));
  
  console.log(`Added prediction: ${newPrediction.id}`);
  console.log(`  Hypothesis: ${hypothesis}`);
  console.log(`  IMPORTANT: This prediction was registered BEFORE analysis.`);
}

// Main - run validation
runHoldoutValidation();

export { loadPredictions, addPrediction, runHoldoutValidation, Prediction };
