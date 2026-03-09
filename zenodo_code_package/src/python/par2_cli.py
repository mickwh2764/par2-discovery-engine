#!/usr/bin/env python3
"""
PAR(2) Discovery Engine - Command Line Interface

Usage: python par2_cli.py --input data.csv --period 24
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

from par2_core import run_par2_analysis, run_batch_analysis


DEFAULT_CLOCK_GENES = ['Per2', 'Arntl', 'Clock', 'Per1', 'Cry1', 'Cry2', 'Nr1d1', 'Nr1d2']
DEFAULT_TARGET_GENES = ['Wee1', 'Ccnd1', 'Myc', 'Cdk1', 'Tp53']


def parse_args():
    parser = argparse.ArgumentParser(
        description='PAR(2) Discovery Engine - Phase-Amplitude-Relationship Analysis',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Input Format:
  CSV with first column = gene names, subsequent columns = timepoints
  Header row should contain timepoint labels (e.g., CT0, CT4, CT8...)

Example:
  python par2_cli.py -i expression.csv -p 24 -c Per2,Arntl -t Wee1,Ccnd1
        """
    )
    
    parser.add_argument('-i', '--input', required=True, help='Input CSV file with gene expression data')
    parser.add_argument('-p', '--period', type=float, default=24.0, help='Circadian period in hours (default: 24)')
    parser.add_argument('-c', '--clock', default=','.join(DEFAULT_CLOCK_GENES), help='Comma-separated list of clock genes')
    parser.add_argument('-t', '--target', default=','.join(DEFAULT_TARGET_GENES), help='Comma-separated list of target genes')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    parser.add_argument('--threshold', type=float, default=0.05, help='Significance threshold (default: 0.05)')
    
    return parser.parse_args()


def parse_csv(filepath: str) -> tuple:
    """Parse CSV file with gene expression data"""
    df = pd.read_csv(filepath, index_col=0)
    
    # Parse timepoints from column headers
    timepoints = []
    for col in df.columns:
        import re
        match = re.search(r'(\d+)', str(col))
        if match:
            timepoints.append(float(match.group(1)))
        else:
            timepoints.append(len(timepoints) * 4)  # Default 4-hour intervals
    
    genes = {}
    for gene_name in df.index:
        expression = df.loc[gene_name].values.astype(float)
        if not np.any(np.isnan(expression)):
            genes[str(gene_name).strip('"')] = expression.tolist()
    
    return genes, timepoints


def main():
    args = parse_args()
    
    if not Path(args.input).exists():
        print(f"Error: Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)
    
    print(f"PAR(2) Discovery Engine", file=sys.stderr)
    print(f"Input: {args.input}", file=sys.stderr)
    print(f"Period: {args.period}h", file=sys.stderr)
    print("", file=sys.stderr)
    
    genes, timepoints = parse_csv(args.input)
    print(f"Loaded {len(genes)} genes, {len(timepoints)} timepoints", file=sys.stderr)
    
    clock_genes = [g.strip() for g in args.clock.split(',')]
    target_genes = [g.strip() for g in args.target.split(',')]
    
    # Find available genes
    available_clocks = [g for g in clock_genes if g in genes]
    available_targets = [g for g in target_genes if g in genes]
    
    if not available_clocks:
        print("Error: No clock genes found in data", file=sys.stderr)
        print(f"Looking for: {', '.join(clock_genes)}", file=sys.stderr)
        print(f"Available: {', '.join(list(genes.keys())[:20])}...", file=sys.stderr)
        sys.exit(1)
    
    if not available_targets:
        print("Error: No target genes found in data", file=sys.stderr)
        sys.exit(1)
    
    print(f"Clock genes found: {', '.join(available_clocks)}", file=sys.stderr)
    print(f"Target genes found: {', '.join(available_targets)}", file=sys.stderr)
    print("", file=sys.stderr)
    
    # Build analysis list
    analyses = []
    for clock in available_clocks:
        for target in available_targets:
            analyses.append({
                'id': f'{clock}->{target}',
                'clockData': {'time': timepoints, 'expression': genes[clock]},
                'targetData': {'time': timepoints, 'expression': genes[target]}
            })
    
    print(f"Running {len(analyses)} pair analyses...", file=sys.stderr)
    
    batch_result = run_batch_analysis(analyses, args.period, args.threshold)
    
    # Format output
    output = {
        'timestamp': datetime.now().isoformat(),
        'config': {
            'period': args.period,
            'threshold': args.threshold,
            'inputFile': Path(args.input).name
        },
        'summary': {
            'totalPairs': len(analyses),
            'significantBeforeFDR': batch_result['fdrCorrection']['significantCount'],
            'significantAfterFDR': batch_result['fdrCorrection']['significantCountAfterFDR']
        },
        'results': [
            {'pair': analyses[i]['id'], **batch_result['results'][i]}
            for i in range(len(analyses))
            if batch_result['results'][i]['significant']
        ]
    }
    
    json_output = json.dumps(output, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(json_output)
        print(f"Results written to {args.output}", file=sys.stderr)
    else:
        print(json_output)
    
    print("", file=sys.stderr)
    print(f"Summary: {output['summary']['significantAfterFDR']}/{output['summary']['totalPairs']} pairs significant (FDR < {args.threshold})", file=sys.stderr)


if __name__ == '__main__':
    main()
