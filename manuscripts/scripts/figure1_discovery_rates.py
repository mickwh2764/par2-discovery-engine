#!/usr/bin/env python3
"""
Figure 1: Discovery Rates Bar Chart
PAR(2) Circadian Gating Analysis
Usage: python figure1_discovery_rates.py
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the data
data = pd.read_csv("figure1_discovery_rates.csv")
data = data.sort_values('Rate', ascending=False)

# Create figure
fig, ax = plt.subplots(figsize=(10, 6))

# Create bar chart
bars = ax.bar(data['Tissue'], data['Rate'].astype(float), 
              color='#22d3ee', edgecolor='#0e7490', linewidth=1)

# Add value labels on bars
for bar, sig, total in zip(bars, data['Significant'], data['Total']):
    height = bar.get_height()
    ax.annotate(f'{sig}/{total}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=9, color='gray')

# Styling
ax.set_xlabel('Tissue', fontsize=12)
ax.set_ylabel('Discovery Rate (%)', fontsize=12)
ax.set_title('Circadian Gating Discovery Rates Across Mouse Tissues', 
             fontsize=14, fontweight='bold')
ax.set_ylim(0, max(data['Rate'].astype(float)) * 1.15)

# Rotate x labels
plt.xticks(rotation=45, ha='right')

# Remove top and right spines
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Grid
ax.yaxis.grid(True, linestyle='--', alpha=0.3)
ax.set_axisbelow(True)

plt.tight_layout()

# Save
plt.savefig('figure1_discovery_rates.pdf', dpi=300, bbox_inches='tight')
plt.savefig('figure1_discovery_rates.png', dpi=300, bbox_inches='tight')
print("Figure 1 saved as figure1_discovery_rates.pdf and .png")
