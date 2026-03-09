#!/usr/bin/env npx tsx
/**
 * PAR(2) Discovery Engine - Command Line Interface
 * 
 * Usage: npx tsx par2-cli.ts --input data.csv --period 24
 */

import * as fs from 'fs';
import * as path from 'path';
import { runPAR2Analysis, runBatchAnalysis, GeneData } from './par2-core';

interface CLIOptions {
  input: string;
  period: number;
  clockGenes: string[];
  targetGenes: string[];
  output?: string;
  threshold: number;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    input: '',
    period: 24,
    clockGenes: ['Per2', 'Arntl', 'Clock', 'Per1', 'Cry1', 'Cry2', 'Nr1d1', 'Nr1d2'],
    targetGenes: ['Wee1', 'Ccnd1', 'Myc', 'Cdk1', 'Tp53'],
    threshold: 0.05
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--period':
      case '-p':
        options.period = parseFloat(args[++i]);
        break;
      case '--clock':
      case '-c':
        options.clockGenes = args[++i].split(',');
        break;
      case '--target':
      case '-t':
        options.targetGenes = args[++i].split(',');
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--threshold':
        options.threshold = parseFloat(args[++i]);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
PAR(2) Discovery Engine - Command Line Interface

Usage: npx tsx par2-cli.ts [options]

Options:
  -i, --input <file>      Input CSV file with gene expression data (required)
  -p, --period <hours>    Circadian period in hours (default: 24)
  -c, --clock <genes>     Comma-separated list of clock genes
  -t, --target <genes>    Comma-separated list of target genes
  -o, --output <file>     Output JSON file (default: stdout)
  --threshold <value>     Significance threshold (default: 0.05)
  -h, --help              Show this help message

Input Format:
  CSV with first column = gene names, subsequent columns = timepoints
  Header row should contain timepoint labels (e.g., CT0, CT4, CT8...)

Example:
  npx tsx par2-cli.ts -i expression.csv -p 24 -c Per2,Arntl -t Wee1,Ccnd1
`);
}

function parseCSV(filepath: string): { genes: Record<string, number[]>; timepoints: number[] } {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const header = lines[0].split(',').map(h => h.trim());
  
  // Parse timepoints from header (skip first column which is gene name)
  const timepoints: number[] = [];
  for (let i = 1; i < header.length; i++) {
    const match = header[i].match(/(\d+)/);
    if (match) {
      timepoints.push(parseFloat(match[1]));
    } else {
      timepoints.push((i - 1) * 4); // Default 4-hour intervals
    }
  }

  const genes: Record<string, number[]> = {};
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < 2) continue;
    
    const geneName = cols[0].replace(/"/g, '');
    const expression = cols.slice(1).map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (expression.length > 0) {
      genes[geneName] = expression;
    }
  }

  return { genes, timepoints };
}

function main(): void {
  const options = parseArgs();

  if (!options.input) {
    console.error('Error: Input file is required. Use --help for usage.');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`Error: Input file not found: ${options.input}`);
    process.exit(1);
  }

  console.error(`PAR(2) Discovery Engine`);
  console.error(`Input: ${options.input}`);
  console.error(`Period: ${options.period}h`);
  console.error('');

  const { genes, timepoints } = parseCSV(options.input);
  console.error(`Loaded ${Object.keys(genes).length} genes, ${timepoints.length} timepoints`);

  // Find available clock and target genes
  const availableClocks = options.clockGenes.filter(g => genes[g]);
  const availableTargets = options.targetGenes.filter(g => genes[g]);

  if (availableClocks.length === 0) {
    console.error('Error: No clock genes found in data');
    console.error(`Looking for: ${options.clockGenes.join(', ')}`);
    console.error(`Available: ${Object.keys(genes).slice(0, 20).join(', ')}...`);
    process.exit(1);
  }

  if (availableTargets.length === 0) {
    console.error('Error: No target genes found in data');
    process.exit(1);
  }

  console.error(`Clock genes found: ${availableClocks.join(', ')}`);
  console.error(`Target genes found: ${availableTargets.join(', ')}`);
  console.error('');

  // Run batch analysis
  const analyses: { targetData: GeneData; clockData: GeneData; id: string }[] = [];

  for (const clock of availableClocks) {
    for (const target of availableTargets) {
      analyses.push({
        id: `${clock}->${target}`,
        clockData: { time: timepoints, expression: genes[clock] },
        targetData: { time: timepoints, expression: genes[target] }
      });
    }
  }

  console.error(`Running ${analyses.length} pair analyses...`);

  const batchResult = runBatchAnalysis(analyses, {
    period: options.period,
    significanceThreshold: options.threshold
  });

  // Format output
  const output = {
    timestamp: new Date().toISOString(),
    config: {
      period: options.period,
      threshold: options.threshold,
      inputFile: path.basename(options.input)
    },
    summary: {
      totalPairs: analyses.length,
      significantBeforeFDR: batchResult.fdrCorrection.significantCount,
      significantAfterFDR: batchResult.fdrCorrection.significantCountAfterFDR
    },
    results: analyses.map((a, i) => ({
      pair: a.id,
      ...batchResult.results[i]
    })).filter(r => r.significant)
  };

  const jsonOutput = JSON.stringify(output, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, jsonOutput);
    console.error(`Results written to ${options.output}`);
  } else {
    console.log(jsonOutput);
  }

  console.error('');
  console.error(`Summary: ${output.summary.significantAfterFDR}/${output.summary.totalPairs} pairs significant (FDR < ${options.threshold})`);
}

main();
