# Figure 2: Circadian Gating Heatmap
# PAR(2) Circadian Gating Analysis
# Usage: Rscript figure2_heatmap.R

library(jsonlite)
library(pheatmap)
library(RColorBrewer)

# Read the heatmap data
data <- fromJSON("figure2_heatmap.json")

# Process each tissue
clock_genes <- data$clockGenes

# Create a combined matrix for all tissues
all_matrices <- list()

for (tissue in names(data$tissues)) {
  tissue_data <- data$tissues[[tissue]]
  
  # Create matrix for this tissue
  genes <- names(tissue_data)
  mat <- matrix(NA, nrow = length(genes), ncol = length(clock_genes))
  rownames(mat) <- genes
  colnames(mat) <- clock_genes
  
  for (gene in genes) {
    values <- tissue_data[[gene]]
    mat[gene, ] <- unlist(values)
  }
  
  all_matrices[[tissue]] <- mat
}

# Create individual heatmaps for each tissue
for (tissue in names(all_matrices)) {
  mat <- all_matrices[[tissue]]
  
  # Replace NA with 0 for visualization
  mat[is.na(mat)] <- 0
  
  # Create heatmap
  pdf(paste0("figure2_heatmap_", tissue, ".pdf"), width = 10, height = 6)
  
  pheatmap(mat,
           main = paste("Circadian Gating in", tissue, "(-log10 p-value)"),
           color = colorRampPalette(c("white", "#22d3ee", "#0891b2"))(50),
           cluster_rows = FALSE,
           cluster_cols = FALSE,
           display_numbers = TRUE,
           number_format = "%.2f",
           fontsize = 10,
           fontsize_number = 8,
           border_color = "gray90",
           na_col = "white")
  
  dev.off()
  
  cat(paste("Saved heatmap for", tissue, "\n"))
}

cat("All heatmaps saved as figure2_heatmap_[Tissue].pdf\n")
