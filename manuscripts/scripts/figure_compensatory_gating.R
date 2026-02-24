# Figure Generation Script: Compensatory Circadian Gating
# PAR(2) Discovery Engine - Novel Findings
# Generated: December 1, 2025

library(ggplot2)
library(dplyr)
library(tidyr)
library(viridis)
library(cowplot)

# Set theme for Cell journal style
theme_cell <- theme_minimal() +
  theme(
    text = element_text(family = "Arial", size = 10),
    plot.title = element_text(size = 12, face = "bold"),
    axis.title = element_text(size = 10),
    axis.text = element_text(size = 9),
    legend.title = element_text(size = 9),
    legend.text = element_text(size = 8),
    panel.grid.minor = element_blank(),
    panel.border = element_rect(color = "black", fill = NA, size = 0.5)
  )

# =============================================================================
# FIGURE 1: Compensatory Gating in Intestinal Organoids
# =============================================================================

intestinal_data <- data.frame(
  condition = c("Wild Type\n(APC-WT/BMAL-WT)", 
                "APC Mutant\n(APC-Mut/BMAL-WT)",
                "BMAL Mutant\n(APC-WT/BMAL-Mut)", 
                "Double Mutant\n(APC-Mut/BMAL-Mut)"),
  significant = c(17, 34, 14, 2),
  discovery_rate = c(11.2, 22.4, 9.2, 1.3),
  fold_change = c(1.0, 2.0, 0.82, 0.12)
)

intestinal_data$condition <- factor(intestinal_data$condition, 
                                    levels = intestinal_data$condition)

fig1a <- ggplot(intestinal_data, aes(x = condition, y = discovery_rate, fill = condition)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = paste0(discovery_rate, "%")), 
            vjust = -0.5, size = 3.5, fontface = "bold") +
  scale_fill_manual(values = c("#2E8B57", "#DC143C", "#FFD700", "#1C1C1C")) +
  labs(
    title = "A. Compensatory Circadian Gating in Intestinal Organoids",
    subtitle = "APC mutation DOUBLES gating; combined mutations cause 17-fold collapse",
    x = "",
    y = "Discovery Rate (%)"
  ) +
  ylim(0, 28) +
  theme_cell +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 0, hjust = 0.5))

# Annotation for key finding
fig1a <- fig1a + 
  annotate("segment", x = 1, xend = 2, y = 24, yend = 24, size = 0.5) +
  annotate("text", x = 1.5, y = 25.5, label = "2× increase", size = 3, fontface = "bold") +
  annotate("segment", x = 2, xend = 4, y = 26, yend = 26, size = 0.5) +
  annotate("text", x = 3, y = 27.5, label = "17× collapse", size = 3, fontface = "bold", color = "red")

ggsave("figure1a_compensatory_gating.pdf", fig1a, width = 8, height = 6, dpi = 300)
ggsave("figure1a_compensatory_gating.png", fig1a, width = 8, height = 6, dpi = 300)

# =============================================================================
# FIGURE 2: Tissue-Specific Gating Signatures
# =============================================================================

tissue_data <- data.frame(
  tissue = c("Liver", "Heart", "Muscle", "Cerebellum", "Hypothalamus", "Kidney"),
  significant = c(25, 16, 14, 8, 7, 3),
  discovery_rate = c(16.4, 10.5, 9.2, 5.3, 4.6, 2.0),
  primary_pathway = c("DNA Repair", "Hippo/YAP", "Proliferation", 
                      "Mitosis", "Metabolism", "Proliferation")
)

tissue_data$tissue <- factor(tissue_data$tissue, 
                             levels = tissue_data$tissue[order(-tissue_data$discovery_rate)])

fig2 <- ggplot(tissue_data, aes(x = reorder(tissue, discovery_rate), 
                                 y = discovery_rate, fill = primary_pathway)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = paste0(discovery_rate, "%")), 
            hjust = -0.2, size = 3.5, fontface = "bold") +
  coord_flip() +
  scale_fill_viridis_d(option = "plasma", begin = 0.1, end = 0.9) +
  labs(
    title = "B. Tissue-Specific Circadian Defense Signatures",
    subtitle = "Each tissue gates distinct cancer-relevant pathways",
    x = "",
    y = "Discovery Rate (%)",
    fill = "Primary Pathway"
  ) +
  xlim(NA, 20) +
  theme_cell +
  theme(legend.position = "right")

ggsave("figure2_tissue_signatures.pdf", fig2, width = 9, height = 5, dpi = 300)
ggsave("figure2_tissue_signatures.png", fig2, width = 9, height = 5, dpi = 300)

# =============================================================================
# FIGURE 3: Pan-Clock Gated Genes Heatmap
# =============================================================================

panclock_data <- data.frame(
  gene = rep(c("TEAD1", "YAP1", "CDK1", "Wee1", "Pparg", "LGR5"), each = 8),
  clock = rep(c("Per1", "Per2", "Cry1", "Cry2", "Clock", "Arntl", "Nr1d1", "Nr1d2"), 6),
  tissue = rep(c("Heart", "Heart", "Cerebellum", "Liver", "WT Intestine", "BMAL-Mut"), each = 8),
  significant = c(
    # TEAD1 - Heart (all significant)
    1, 1, 1, 1, 1, 1, 1, 1,
    # YAP1 - Heart (all significant)  
    1, 1, 1, 1, 1, 1, 1, 1,
    # CDK1 - Cerebellum (all significant)
    1, 1, 1, 1, 1, 1, 1, 1,
    # Wee1 - Liver (all significant)
    1, 1, 1, 1, 1, 1, 1, 1,
    # Pparg - WT Intestine (all significant)
    1, 1, 1, 1, 1, 1, 1, 1,
    # LGR5 - BMAL-Mut (all significant)
    1, 1, 1, 1, 1, 1, 1, 1
  ),
  p_value = c(
    # TEAD1
    0.021, 0.007, 0.009, 0.006, 0.007, 0.010, 0.006, 0.020,
    # YAP1
    0.030, 0.017, 0.018, 0.017, 0.017, 0.019, 0.017, 0.026,
    # CDK1
    0.013, 0.016, 0.016, 0.020, 0.026, 0.021, 0.011, 0.013,
    # Wee1
    0.014, 0.013, 0.010, 0.011, 0.015, 0.020, 0.010, 0.017,
    # Pparg
    0.006, 0.007, 0.006, 0.009, 0.005, 0.011, 0.010, 0.005,
    # LGR5
    0.019, 0.013, 0.014, 0.030, 0.021, 0.012, 0.046, 0.041
  )
)

panclock_data$gene <- factor(panclock_data$gene, 
                              levels = c("TEAD1", "YAP1", "CDK1", "Wee1", "Pparg", "LGR5"))
panclock_data$clock <- factor(panclock_data$clock,
                               levels = c("Per1", "Per2", "Cry1", "Cry2", 
                                         "Clock", "Arntl", "Nr1d1", "Nr1d2"))

fig3 <- ggplot(panclock_data, aes(x = clock, y = gene, fill = -log10(p_value))) +
  geom_tile(color = "white", size = 0.5) +
  geom_text(aes(label = sprintf("%.3f", p_value)), size = 2.5, color = "white") +
  scale_fill_viridis_c(option = "magma", begin = 0.2, end = 0.9,
                       name = "-log10(p)") +
  facet_wrap(~tissue, nrow = 1, scales = "free_y") +
  labs(
    title = "C. Pan-Clock Gated Genes: All 8 Clock Components",
    subtitle = "These genes show comprehensive circadian control",
    x = "Clock Gene",
    y = "Target Gene"
  ) +
  theme_cell +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        strip.text = element_text(face = "bold"))

ggsave("figure3_panclock_heatmap.pdf", fig3, width = 14, height = 5, dpi = 300)
ggsave("figure3_panclock_heatmap.png", fig3, width = 14, height = 5, dpi = 300)

# =============================================================================
# FIGURE 4: APC Mutant Enhanced Gating Detail
# =============================================================================

apc_mut_data <- data.frame(
  gene = c("Ccnb1", "Wee1", "Sirt1", "Tp53", "Pparg", "Tead1", "Myc", "Mdm2"),
  role = c("G2/M Transition", "G2/M Checkpoint", "NAD+ Sensor", 
           "Tumor Suppressor", "Lipid Metabolism", "YAP Co-activator",
           "Proliferation", "p53 Regulator"),
  num_clocks = c(7, 4, 5, 3, 7, 6, 1, 1),
  min_p = c(0.001, 0.002, 0.002, 0.016, 0.027, 0.023, 0.047, 0.037)
)

apc_mut_data$gene <- factor(apc_mut_data$gene, 
                            levels = apc_mut_data$gene[order(-apc_mut_data$num_clocks)])

fig4 <- ggplot(apc_mut_data, aes(x = reorder(gene, num_clocks), y = num_clocks, fill = role)) +
  geom_bar(stat = "identity", width = 0.7) +
  geom_text(aes(label = num_clocks), hjust = -0.3, size = 4, fontface = "bold") +
  coord_flip() +
  scale_fill_brewer(palette = "Set2") +
  labs(
    title = "D. Enhanced Gating in APC-Mutant Organoids",
    subtitle = "Compensatory control focuses on cell cycle and metabolism genes",
    x = "",
    y = "Number of Clock Genes Gating",
    fill = "Gene Function"
  ) +
  ylim(0, 9) +
  theme_cell

ggsave("figure4_apc_mutant_detail.pdf", fig4, width = 9, height = 6, dpi = 300)
ggsave("figure4_apc_mutant_detail.png", fig4, width = 9, height = 6, dpi = 300)

# =============================================================================
# COMBINED FIGURE PANEL
# =============================================================================

combined_figure <- plot_grid(
  fig1a, fig2,
  fig4, fig3,
  labels = c("A", "B", "C", "D"),
  ncol = 2,
  rel_heights = c(1, 1.2)
)

ggsave("figure_combined_novel_findings.pdf", combined_figure, 
       width = 16, height = 12, dpi = 300)
ggsave("figure_combined_novel_findings.png", combined_figure, 
       width = 16, height = 12, dpi = 300)

cat("\n=== Figure Generation Complete ===\n")
cat("Generated files:\n")
cat("  - figure1a_compensatory_gating.pdf/png\n")
cat("  - figure2_tissue_signatures.pdf/png\n")
cat("  - figure3_panclock_heatmap.pdf/png\n")
cat("  - figure4_apc_mutant_detail.pdf/png\n")
cat("  - figure_combined_novel_findings.pdf/png\n")
cat("\nKey statistics:\n")
cat("  - Compensatory amplification: 11.2% -> 22.4% (2x increase)\n")
cat("  - Gating collapse: 22.4% -> 1.3% (17x reduction)\n")
cat("  - Tissues analyzed: 6\n")
cat("  - Intestinal conditions: 4\n")
cat("  - Total gene pairs tested per condition: 152\n")