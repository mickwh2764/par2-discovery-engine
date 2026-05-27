#!/usr/bin/env python3
"""
Figure 2: Circadian Gating Heatmap
PAR(2) Circadian Gating Analysis
Usage: python figure2_heatmap.py
"""

import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Read the heatmap data
with open("figure2_heatmap.json", "r") as f:
    data = json.load(f)

clock_genes = data["clockGenes"]

# Create heatmaps for each tissue
for tissue, targets in data["tissues"].items():
    # Create dataframe
    genes = list(targets.keys())
    matrix = np.zeros((len(genes), len(clock_genes)))
    
    for i, gene in enumerate(genes):
        values = targets[gene]
        for j, val in enumerate(values):
            if val is not None:
                matrix[i, j] = val
    
    df = pd.DataFrame(matrix, index=genes, columns=clock_genes)
    
    # Create heatmap
    fig, ax = plt.subplots(figsize=(12, max(4, len(genes) * 0.5)))
    
    sns.heatmap(df, 
                annot=True, 
                fmt=".2f",
                cmap="YlGnBu",
                cbar_kws={'label': '-log10(p-value)'},
                linewidths=0.5,
                linecolor='white',
                ax=ax)
    
    ax.set_title(f'Circadian Gating in {tissue}\n(-log10 p-value)', 
                 fontsize=14, fontweight='bold')
    ax.set_xlabel('Clock Gene', fontsize=12)
    ax.set_ylabel('Target Gene', fontsize=12)
    
    plt.tight_layout()
    
    # Save
    plt.savefig(f'figure2_heatmap_{tissue.replace(" ", "_")}.pdf', 
                dpi=300, bbox_inches='tight')
    plt.savefig(f'figure2_heatmap_{tissue.replace(" ", "_")}.png', 
                dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"Saved heatmap for {tissue}")

print("All heatmaps saved as figure2_heatmap_[Tissue].pdf/png")
