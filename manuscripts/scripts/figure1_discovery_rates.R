# Figure 1: Discovery Rates Bar Chart
# PAR(2) Circadian Gating Analysis
# Usage: Rscript figure1_discovery_rates.R

library(ggplot2)
library(dplyr)

# Read the data
data <- read.csv("figure1_discovery_rates.csv")

# Create the plot
p <- ggplot(data, aes(x = reorder(Tissue, -as.numeric(Rate)), y = as.numeric(Rate))) +
  geom_bar(stat = "identity", fill = "#22d3ee", width = 0.7) +
  geom_text(aes(label = paste0(Significant, "/", Total)), 
            vjust = -0.5, size = 3, color = "gray30") +
  labs(
    x = "Tissue",
    y = "Discovery Rate (%)",
    title = "Circadian Gating Discovery Rates Across Mouse Tissues",
    subtitle = "Significant PAR(2) clock-target pairs at p < 0.05"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14),
    plot.subtitle = element_text(color = "gray50", size = 10),
    axis.text.x = element_text(angle = 45, hjust = 1, size = 10),
    axis.title = element_text(size = 11),
    panel.grid.major.x = element_blank(),
    panel.grid.minor = element_blank()
  ) +
  scale_y_continuous(expand = expansion(mult = c(0, 0.1)))

# Save the figure
ggsave("figure1_discovery_rates.pdf", p, width = 8, height = 6, dpi = 300)
ggsave("figure1_discovery_rates.png", p, width = 8, height = 6, dpi = 300)

cat("Figure 1 saved as figure1_discovery_rates.pdf and .png\n")
