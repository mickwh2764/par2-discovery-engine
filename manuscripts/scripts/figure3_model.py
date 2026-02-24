#!/usr/bin/env python3
"""
Figure 3: Tissue Vulnerability Protection Model
PAR(2) Circadian Gating Analysis

Note: This script creates a basic diagram. For publication quality,
consider using BioRender, Adobe Illustrator, or Inkscape.

Usage: python figure3_model.py
"""

import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# Read the model data
with open("figure3_pathway_model.json", "r") as f:
    data = json.load(f)

# Create figure
fig, ax = plt.subplots(figsize=(14, 10))
ax.set_xlim(0, 14)
ax.set_ylim(0, 10)
ax.axis('off')

# Colors for tissues
tissue_colors = {
    'Liver': '#ef4444',
    'Heart': '#a855f7',
    'Kidney': '#3b82f6',
    'Cerebellum': '#22c55e',
    'Hypothalamus': '#f97316'
}

# Central clock
clock_center = (7, 8)
clock_radius = 1.2

clock_circle = plt.Circle(clock_center, clock_radius, 
                          facecolor='#0891b2', edgecolor='#0e7490',
                          linewidth=3, alpha=0.9)
ax.add_patch(clock_circle)
ax.text(clock_center[0], clock_center[1], 'CIRCADIAN\nCLOCK', 
        ha='center', va='center', fontsize=11, fontweight='bold',
        color='white')

# Tissue boxes
positions = {
    'Liver': (2, 4.5),
    'Heart': (5, 2),
    'Kidney': (9, 2),
    'Cerebellum': (12, 4.5),
    'Hypothalamus': (7, 4)
}

for tissue_data in data['tissues']:
    name = tissue_data['name']
    pos = positions.get(name, (7, 5))
    color = tissue_colors.get(name, '#666')
    
    # Create tissue box
    box = FancyBboxPatch((pos[0] - 1.3, pos[1] - 1),
                         2.6, 2,
                         boxstyle="round,rounding_size=0.2",
                         facecolor=color,
                         edgecolor='white',
                         linewidth=2,
                         alpha=0.85)
    ax.add_patch(box)
    
    # Tissue name
    ax.text(pos[0], pos[1] + 0.5, name, ha='center', va='center',
            fontsize=10, fontweight='bold', color='white')
    
    # Pathway
    ax.text(pos[0], pos[1], tissue_data['pathway'], ha='center', va='center',
            fontsize=7, color='white', style='italic',
            wrap=True)
    
    # Targets
    targets_str = ', '.join(tissue_data['targets'][:3])
    if len(tissue_data['targets']) > 3:
        targets_str += '...'
    ax.text(pos[0], pos[1] - 0.5, targets_str, ha='center', va='center',
            fontsize=6, color='white', alpha=0.9)
    
    # Arrow from clock to tissue
    arrow = FancyArrowPatch(
        (clock_center[0] + (pos[0] - clock_center[0]) * 0.3,
         clock_center[1] + (pos[1] - clock_center[1]) * 0.3 - clock_radius * 0.8),
        (pos[0], min(pos[1] + 1.2, 8)),
        arrowstyle='-|>',
        mutation_scale=15,
        color='#0891b2',
        linewidth=2,
        alpha=0.7
    )
    ax.add_patch(arrow)

# Legend
legend_y = 0.8
ax.text(0.5, legend_y, 'VULNERABILITY:', fontsize=9, fontweight='bold')
legend_items = [
    ('Liver', 'Hepatocellular carcinoma'),
    ('Heart', 'Cardiac hypertrophy'),
    ('Kidney', 'Renal cell carcinoma'),
    ('Cerebellum', 'Medulloblastoma'),
    ('Hypothalamus', 'Neurodegeneration')
]

for i, (tissue, vuln) in enumerate(legend_items):
    color = tissue_colors[tissue]
    rect = plt.Rectangle((2.5 + i * 2.3, legend_y - 0.3), 0.3, 0.3,
                         facecolor=color, edgecolor='white')
    ax.add_patch(rect)
    ax.text(2.9 + i * 2.3, legend_y - 0.15, vuln, fontsize=6, va='center')

# Title
ax.text(7, 9.5, 'Tissue Vulnerability Protection Model', 
        ha='center', fontsize=16, fontweight='bold')
ax.text(7, 9.1, 'Each tissue uses circadian gating to protect its most vulnerable pathway',
        ha='center', fontsize=10, style='italic', color='gray')

plt.tight_layout()
plt.savefig('figure3_pathway_model.pdf', dpi=300, bbox_inches='tight')
plt.savefig('figure3_pathway_model.png', dpi=300, bbox_inches='tight')
print("Figure 3 saved as figure3_pathway_model.pdf/png")
print("\nNote: For publication quality, consider recreating in BioRender or Illustrator")
