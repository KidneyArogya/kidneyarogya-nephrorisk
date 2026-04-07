
import { RiskResult } from "@/lib/riskModel";
import { motion } from "framer-motion";

interface Props {
  result: RiskResult;
  onReset: () => void;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
    ringColor: "ring-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  moderate: {
    label: "Moderate Risk",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    barColor: "bg-amber-500",
    ringColor: "ring-amber-200",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  high: {
    label: "High Risk",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    barColor: "bg-orange-500",
    ringColor: "ring-orange-200",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "very-high": {
    label: "Very High Risk",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    barColor: "bg-red-500",
    ringColor: "ring-red-200",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
};

const categoryLabel: Record<string, string> = {
  demographic: "Demographics",
  comorbidity: "Risk Factors",
  symptom: "Symptoms",
  lab: "Laboratory",
};

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border border-red-200" },
  routine: { label: "Routine", className: "bg-blue-100 text-blue-700 border border-blue-200" },
  consider: { label: "Consider", className: "bg-slate-100 text-slate-600 border border-slate-200" },
};

export default function ResultPanel({ result, onReset }: Props) {
  const cfg = riskConfig[result.riskLevel];
  const maxContrib = Math.max(...result.riskFactors.map((f) => f.contribution), 0.1);

  const urgentInv = result.investigations.filter((i) => i.priority === "urgent");
  const routineInv = result.investigations.filter((i) => i.priority === "routine");
  const considerInv = result.investigations.filter((i) => i.priority === "consider");

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border-2 ${cfg.borderColor} ${cfg.bgColor} p-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" className="text-white/60" strokeWidth="14" />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                className={cfg.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - result.probability / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`text-3xl font-bold ${cfg.color}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {result.probability}%
              </motion.span>
              <span className="text-xs text-muted-foreground">probability</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.badgeClass} mb-2`}>
                {cfg.label}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{result.interpretation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold text-foreground text-sm">Major Contributing Factors</h3>
          </div>
          <div className="p-4 space-y-3">
            {result.riskFactors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No significant risk factors identified</p>
            ) : (
              result.riskFactors.map((factor, i) => (
                <motion.div
                  key={factor.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                        backgroundColor:
                          factor.category === "lab" ? "#6366f1" :
                          factor.category === "comorbidity" ? "#f59e0b" :
                          factor.category === "symptom" ? "#ef4444" :
                          "#64748b"
                      }} />
                      <span className="text-xs text-foreground truncate">{factor.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {categoryLabel[factor.category]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${cfg.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(factor.contribution / maxContrib) * 100}%` }}
                      transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))
            )}
            <div className="flex gap-3 pt-2 flex-wrap">
              {Object.entries({ lab: "#6366f1", comorbidity: "#f59e0b", symptom: "#ef4444", demographic: "#64748b" }).map(([key, color]) => (
                <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {categoryLabel[key]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-semibold text-foreground text-sm">Suggested Investigations</h3>
          </div>
          <div className="divide-y divide-border">
            {[
              { group: urgentInv, key: "urgent" as const },
              { group: routineInv, key: "routine" as const },
              { group: considerInv, key: "consider" as const },
            ]
              .filter(({ group }) => group.length > 0)
              .map(({ group, key }) => (
                <div key={key}>
                  <div className="px-4 pt-3 pb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${priorityConfig[key].className}`}>
                      {priorityConfig[key].label}
                    </span>
                  </div>
                  <div className="px-4 pb-3 space-y-2">
                    {group.map((inv, i) => (
                      <motion.div
                        key={inv.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{inv.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{inv.rationale}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/40 border border-border rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This estimate is generated by <strong>Kidney Arogya - NephroRisk</strong>, a logistic regression model derived from population-level epidemiological cohort data. It is intended as a <strong>decision-support aid</strong> for trained clinicians — not a diagnostic instrument. Clinical judgement, patient history, and gold-standard investigations must guide all management decisions. This tool does not replace specialist nephrology review.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="border border-border bg-card text-foreground text-sm font-medium px-8 py-3 rounded-xl hover:bg-muted transition-colors"
        >
          Assess Another Patient
        </button>
      </div>
    </div>
  );
}
