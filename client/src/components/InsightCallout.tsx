import { Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";

interface InsightCalloutProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "finding" | "warning";
}

const variantConfig = {
  info: {
    border: "border-l-cyan-400",
    icon: Lightbulb,
    iconColor: "text-cyan-400",
  },
  finding: {
    border: "border-l-emerald-400",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
  },
  warning: {
    border: "border-l-amber-400",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
};

export default function InsightCallout({
  title = "What This Means",
  children,
  variant = "info",
}: InsightCalloutProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`bg-slate-900/80 border border-slate-700/50 border-l-4 ${config.border} rounded-lg p-4 space-y-2`}
      data-testid="insight-callout"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={config.iconColor} />
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      <div className="text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}
