
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { computeRisk, PatientInputs, RiskResult } from "@/lib/riskModel";
import ResultPanel from "@/components/ResultPanel";
import Disclaimer from "@/components/Disclaimer";

const schema = z.object({
  age: z.number({ required_error: "Age required" }).int().min(1).max(120),
  sex: z.enum(["male", "female"]),
  diabetes: z.boolean(),
  hypertension: z.boolean(),
  cardiovascularDisease: z.boolean(),
  familyHistoryCKD: z.boolean(),
  obesity: z.boolean(),
  smoking: z.boolean(),
  nsaidUse: z.boolean(),
  contrastExposure: z.boolean(),

  edema: z.boolean(),
  foamyUrine: z.boolean(),
  hematuria: z.boolean(),
  reducedUrineOutput: z.boolean(),
  fatigueMalaise: z.boolean(),
  nausea: z.boolean(),
  flankPain: z.boolean(),
  frequentUTI: z.boolean(),
  hypertensiveOnPresentation: z.boolean(),
  anemia: z.boolean(),

  eGFRReduced: z.enum(["unknown", "mild", "moderate", "severe"]),
  proteinuria: z.enum(["unknown", "trace", "1+", "2+", "3+"]),
  creatinineElevated: z.boolean(),
  urineAbnormalSediment: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  age: 45,
  sex: "male",
  diabetes: false,
  hypertension: false,
  cardiovascularDisease: false,
  familyHistoryCKD: false,
  obesity: false,
  smoking: false,
  nsaidUse: false,
  contrastExposure: false,

  edema: false,
  foamyUrine: false,
  hematuria: false,
  reducedUrineOutput: false,
  fatigueMalaise: false,
  nausea: false,
  flankPain: false,
  frequentUTI: false,
  hypertensiveOnPresentation: false,
  anemia: false,

  eGFRReduced: "unknown",
  proteinuria: "unknown",
  creatinineElevated: false,
  urineAbnormalSediment: false,
};

function CheckField({ label, name, control }: { label: string; name: keyof FormValues; control: any }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors group">
          <div
            onClick={() => field.onChange(!field.value)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              field.value
                ? "bg-primary border-primary"
                : "border-border bg-card group-hover:border-primary/60"
            }`}
          >
            {field.value && (
              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span
            className="text-sm text-foreground leading-snug select-none"
            onClick={() => field.onChange(!field.value)}
          >
            {label}
          </span>
        </label>
      )}
    />
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-muted/30">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-foreground text-base tracking-tight">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  control,
}: {
  label: string;
  name: keyof FormValues;
  options: { value: string; label: string }[];
  control: any;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );
}

export default function Assessor() {
  const [result, setResult] = useState<RiskResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { control, handleSubmit, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    const r = computeRisk(data as PatientInputs);
    setResult(r);
    setShowResult(true);
    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setShowResult(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kidney-arogya-logo.png"
              alt="Kidney Arogya - NephroRisk Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm flex-shrink-0 rounded-full"
            />
            <div>
              <h1 className="font-bold text-foreground text-sm sm:text-base leading-tight tracking-tight">
                Kidney Arogya
                <span className="text-primary"> - NephroRisk</span>
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">Kidney Disease Risk Estimator</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block bg-muted px-3 py-1.5 rounded-full border border-border">
            Decision-support tool · Not a diagnosis
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Disclaimer />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Patient Demographics" icon="👤">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Age (years)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    {...register("age", { valueAsNumber: true })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    placeholder="e.g. 58"
                  />
                  {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
                </div>
                <SelectField
                  label="Biological sex"
                  name="sex"
                  control={control}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
              </div>
            </SectionCard>

            <SectionCard title="Risk Factors & Comorbidities" icon="⚕️">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                <CheckField label="Diabetes mellitus" name="diabetes" control={control} />
                <CheckField label="Hypertension" name="hypertension" control={control} />
                <CheckField label="Cardiovascular disease" name="cardiovascularDisease" control={control} />
                <CheckField label="Family history of CKD" name="familyHistoryCKD" control={control} />
                <CheckField label="Obesity (BMI ≥30)" name="obesity" control={control} />
                <CheckField label="Current / recent smoker" name="smoking" control={control} />
                <CheckField label="Chronic NSAID use" name="nsaidUse" control={control} />
                <CheckField label="Recent contrast exposure" name="contrastExposure" control={control} />
              </div>
            </SectionCard>

            <SectionCard title="Symptoms & Signs" icon="🩺">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                <CheckField label="Peripheral / periorbital oedema" name="edema" control={control} />
                <CheckField label="Foamy / frothy urine" name="foamyUrine" control={control} />
                <CheckField label="Haematuria (blood in urine)" name="hematuria" control={control} />
                <CheckField label="Oliguria / reduced urine output" name="reducedUrineOutput" control={control} />
                <CheckField label="Fatigue / malaise" name="fatigueMalaise" control={control} />
                <CheckField label="Nausea / vomiting" name="nausea" control={control} />
                <CheckField label="Flank / loin pain" name="flankPain" control={control} />
                <CheckField label="Recurrent UTIs" name="frequentUTI" control={control} />
                <CheckField label="Hypertensive on presentation" name="hypertensiveOnPresentation" control={control} />
                <CheckField label="Signs of anaemia / pallor" name="anemia" control={control} />
              </div>
            </SectionCard>

            <SectionCard title="Laboratory Results (if available)" icon="🔬">
              <div className="space-y-4">
                <SelectField
                  label="eGFR status"
                  name="eGFRReduced"
                  control={control}
                  options={[
                    { value: "unknown", label: "Not known / not tested" },
                    { value: "mild", label: "Mildly reduced (60–89 mL/min/1.73m²)" },
                    { value: "moderate", label: "Moderately reduced (30–59 mL/min/1.73m²)" },
                    { value: "severe", label: "Severely reduced (<30 mL/min/1.73m²)" },
                  ]}
                />
                <SelectField
                  label="Dipstick proteinuria"
                  name="proteinuria"
                  control={control}
                  options={[
                    { value: "unknown", label: "Not tested" },
                    { value: "trace", label: "Trace" },
                    { value: "1+", label: "1+" },
                    { value: "2+", label: "2+" },
                    { value: "3+", label: "3+ (nephrotic range)" },
                  ]}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 pt-1">
                  <CheckField label="Elevated serum creatinine" name="creatinineElevated" control={control} />
                  <CheckField label="Abnormal urine sediment" name="urineAbnormalSediment" control={control} />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold px-10 py-3.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
            >
              Estimate Kidney Disease Risk
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showResult && result && (
            <motion.div
              id="result-section"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ResultPanel result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/kidney-arogya-logo.png" alt="Kidney Arogya - NephroRisk" className="w-7 h-7 object-contain opacity-80 rounded-full" />
            <span className="text-sm font-semibold text-muted-foreground tracking-tight">
              Kidney Arogya <span className="text-primary/70">- NephroRisk</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
            Kidney Arogya - NephroRisk uses a logistic model calibrated to published epidemiological data (CKD Prognosis Consortium, KDIGO 2024, GBD 2021). Estimates are probabilistic and depend entirely on clinician-entered data. Not validated as a standalone diagnostic instrument.
          </p>
        </div>
      </footer>
    </div>
  );
}
