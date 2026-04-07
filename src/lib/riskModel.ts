
export interface PatientInputs {
  age: number;
  sex: "male" | "female";
  diabetes: boolean;
  hypertension: boolean;
  cardiovascularDisease: boolean;
  familyHistoryCKD: boolean;
  obesity: boolean;
  smoking: boolean;
  nsaidUse: boolean;
  contrastExposure: boolean;

  edema: boolean;
  foamyUrine: boolean;
  hematuria: boolean;
  reducedUrineOutput: boolean;
  fatigueMalaise: boolean;
  nausea: boolean;
  flankPain: boolean;
  frequentUTI: boolean;
  hypertensiveOnPresentation: boolean;
  anemia: boolean;

  eGFRReduced: "unknown" | "mild" | "moderate" | "severe";
  proteinuria: "unknown" | "trace" | "1+" | "2+" | "3+";
  creatinineElevated: boolean;
  urineAbnormalSediment: boolean;
}

export interface RiskFactor {
  name: string;
  contribution: number;
  category: "demographic" | "comorbidity" | "symptom" | "lab";
}

export interface RiskResult {
  probability: number;
  riskLevel: "low" | "moderate" | "high" | "very-high";
  riskFactors: RiskFactor[];
  investigations: Investigation[];
  interpretation: string;
}

export interface Investigation {
  name: string;
  rationale: string;
  priority: "urgent" | "routine" | "consider";
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function computeRisk(inputs: PatientInputs): RiskResult {
  const factors: RiskFactor[] = [];

  let logit = -3.5;

  const popPrevalence = 0.14;
  logit += Math.log(popPrevalence / (1 - popPrevalence));

  if (inputs.age >= 60) {
    const ageScore = inputs.age >= 75 ? 1.4 : inputs.age >= 60 ? 0.9 : 0;
    if (ageScore > 0) {
      factors.push({ name: `Age ≥60 (age: ${inputs.age})`, contribution: ageScore, category: "demographic" });
      logit += ageScore;
    }
  } else if (inputs.age >= 45) {
    factors.push({ name: `Age 45–59 (age: ${inputs.age})`, contribution: 0.45, category: "demographic" });
    logit += 0.45;
  }

  if (inputs.sex === "male") {
    factors.push({ name: "Male sex", contribution: 0.18, category: "demographic" });
    logit += 0.18;
  }

  if (inputs.diabetes) {
    factors.push({ name: "Diabetes mellitus", contribution: 1.6, category: "comorbidity" });
    logit += 1.6;
  }
  if (inputs.hypertension) {
    factors.push({ name: "Hypertension", contribution: 1.3, category: "comorbidity" });
    logit += 1.3;
  }
  if (inputs.cardiovascularDisease) {
    factors.push({ name: "Cardiovascular disease", contribution: 0.8, category: "comorbidity" });
    logit += 0.8;
  }
  if (inputs.familyHistoryCKD) {
    factors.push({ name: "Family history of CKD", contribution: 0.7, category: "comorbidity" });
    logit += 0.7;
  }
  if (inputs.obesity) {
    factors.push({ name: "Obesity (BMI ≥30)", contribution: 0.55, category: "comorbidity" });
    logit += 0.55;
  }
  if (inputs.smoking) {
    factors.push({ name: "Smoking (current/recent)", contribution: 0.4, category: "comorbidity" });
    logit += 0.4;
  }
  if (inputs.nsaidUse) {
    factors.push({ name: "Chronic NSAID use", contribution: 0.5, category: "comorbidity" });
    logit += 0.5;
  }
  if (inputs.contrastExposure) {
    factors.push({ name: "Recent contrast agent exposure", contribution: 0.45, category: "comorbidity" });
    logit += 0.45;
  }

  if (inputs.edema) {
    factors.push({ name: "Peripheral/periorbital oedema", contribution: 1.1, category: "symptom" });
    logit += 1.1;
  }
  if (inputs.foamyUrine) {
    factors.push({ name: "Foamy/frothy urine", contribution: 1.2, category: "symptom" });
    logit += 1.2;
  }
  if (inputs.hematuria) {
    factors.push({ name: "Haematuria", contribution: 1.0, category: "symptom" });
    logit += 1.0;
  }
  if (inputs.reducedUrineOutput) {
    factors.push({ name: "Oliguria / reduced urine output", contribution: 1.4, category: "symptom" });
    logit += 1.4;
  }
  if (inputs.fatigueMalaise) {
    factors.push({ name: "Fatigue / malaise", contribution: 0.4, category: "symptom" });
    logit += 0.4;
  }
  if (inputs.nausea) {
    factors.push({ name: "Nausea / vomiting", contribution: 0.55, category: "symptom" });
    logit += 0.55;
  }
  if (inputs.flankPain) {
    factors.push({ name: "Flank / loin pain", contribution: 0.65, category: "symptom" });
    logit += 0.65;
  }
  if (inputs.frequentUTI) {
    factors.push({ name: "Recurrent UTIs", contribution: 0.6, category: "symptom" });
    logit += 0.6;
  }
  if (inputs.hypertensiveOnPresentation) {
    factors.push({ name: "Hypertensive on presentation (if not known hypertensive)", contribution: 0.7, category: "symptom" });
    logit += 0.7;
  }
  if (inputs.anemia) {
    factors.push({ name: "Pallor / anaemia signs", contribution: 0.7, category: "symptom" });
    logit += 0.7;
  }

  if (inputs.eGFRReduced === "severe") {
    factors.push({ name: "eGFR severely reduced (<30)", contribution: 2.5, category: "lab" });
    logit += 2.5;
  } else if (inputs.eGFRReduced === "moderate") {
    factors.push({ name: "eGFR moderately reduced (30–59)", contribution: 1.8, category: "lab" });
    logit += 1.8;
  } else if (inputs.eGFRReduced === "mild") {
    factors.push({ name: "eGFR mildly reduced (60–89)", contribution: 0.9, category: "lab" });
    logit += 0.9;
  }

  if (inputs.proteinuria === "3+") {
    factors.push({ name: "Proteinuria 3+ (nephrotic range)", contribution: 2.2, category: "lab" });
    logit += 2.2;
  } else if (inputs.proteinuria === "2+") {
    factors.push({ name: "Proteinuria 2+", contribution: 1.5, category: "lab" });
    logit += 1.5;
  } else if (inputs.proteinuria === "1+") {
    factors.push({ name: "Proteinuria 1+", contribution: 0.8, category: "lab" });
    logit += 0.8;
  } else if (inputs.proteinuria === "trace") {
    factors.push({ name: "Trace proteinuria", contribution: 0.3, category: "lab" });
    logit += 0.3;
  }

  if (inputs.creatinineElevated) {
    factors.push({ name: "Elevated serum creatinine", contribution: 1.6, category: "lab" });
    logit += 1.6;
  }
  if (inputs.urineAbnormalSediment) {
    factors.push({ name: "Abnormal urine sediment (casts/cells)", contribution: 1.2, category: "lab" });
    logit += 1.2;
  }

  const rawProb = clamp(logistic(logit), 0.01, 0.99);
  const probability = Math.round(rawProb * 100);

  let riskLevel: RiskResult["riskLevel"];
  if (probability < 20) riskLevel = "low";
  else if (probability < 45) riskLevel = "moderate";
  else if (probability < 70) riskLevel = "high";
  else riskLevel = "very-high";

  const investigations = buildInvestigations(inputs, riskLevel);

  const sorted = [...factors].sort((a, b) => b.contribution - a.contribution).slice(0, 8);

  const interpretation = buildInterpretation(probability, riskLevel, factors.length);

  return { probability, riskLevel, riskFactors: sorted, investigations, interpretation };
}

function buildInvestigations(
  inputs: PatientInputs,
  riskLevel: RiskResult["riskLevel"]
): Investigation[] {
  const inv: Investigation[] = [];

  const isHighRisk = riskLevel === "high" || riskLevel === "very-high";
  const urgency: "urgent" | "routine" = isHighRisk ? "urgent" : "routine";

  inv.push({
    name: "Serum creatinine & eGFR",
    rationale: "Essential to quantify renal function and stage CKD if present",
    priority: urgency,
  });
  inv.push({
    name: "Urine dipstick + microscopy",
    rationale: "Detects proteinuria, haematuria, and sediment abnormalities",
    priority: urgency,
  });
  inv.push({
    name: "Urine albumin-to-creatinine ratio (ACR)",
    rationale: "Quantifies proteinuria; ACR >30 mg/g is a CKD criterion",
    priority: urgency,
  });
  inv.push({
    name: "FBC (full blood count)",
    rationale: "Anaemia of CKD is common; baseline for severity assessment",
    priority: "routine",
  });
  inv.push({
    name: "Serum electrolytes (Na, K, Cl, HCO₃)",
    rationale: "Identifies electrolyte disturbances and metabolic acidosis",
    priority: urgency,
  });
  inv.push({
    name: "Renal ultrasound",
    rationale: "Assesses kidney size, echogenicity, obstruction, and structural abnormalities",
    priority: isHighRisk ? "urgent" : "routine",
  });

  if (inputs.diabetes) {
    inv.push({
      name: "HbA1c & fasting glucose",
      rationale: "Assess glycaemic control — the leading cause of CKD globally",
      priority: "routine",
    });
  }
  if (inputs.hypertension || inputs.hypertensiveOnPresentation) {
    inv.push({
      name: "Blood pressure monitoring (serial readings)",
      rationale: "Uncontrolled hypertension accelerates renal decline",
      priority: urgency,
    });
  }
  if (inputs.foamyUrine || inputs.edema || inputs.proteinuria === "3+" || inputs.proteinuria === "2+") {
    inv.push({
      name: "24-hour urine protein",
      rationale: "Nephrotic-range proteinuria (>3.5 g/day) indicates glomerular disease",
      priority: urgency,
    });
    inv.push({
      name: "Serum albumin",
      rationale: "Hypoalbuminaemia confirms nephrotic syndrome",
      priority: urgency,
    });
  }
  if (inputs.hematuria || inputs.urineAbnormalSediment) {
    inv.push({
      name: "Urine culture (MSU)",
      rationale: "Exclude infective cause of haematuria before structural workup",
      priority: "routine",
    });
    inv.push({
      name: "Cystoscopy / urine cytology",
      rationale: "Rule out urothelial malignancy in persistent haematuria",
      priority: "consider",
    });
  }
  if (inputs.reducedUrineOutput || (inputs.eGFRReduced === "severe")) {
    inv.push({
      name: "Bladder post-void residual (USS)",
      rationale: "Exclude obstructive uropathy as reversible cause of AKI/CKD",
      priority: "urgent",
    });
    inv.push({
      name: "Nephrology referral",
      rationale: "Severe or rapidly progressive kidney disease warrants specialist evaluation",
      priority: "urgent",
    });
  }
  if (inputs.familyHistoryCKD) {
    inv.push({
      name: "Genetic / hereditary nephropathy screen",
      rationale: "Consider Alport syndrome, ADPKD, or other monogenic CKD if family history present",
      priority: "consider",
    });
  }
  if (inputs.cardiovascularDisease || inputs.diabetes) {
    inv.push({
      name: "Lipid profile",
      rationale: "Dyslipidaemia increases cardiovascular risk in CKD; statins may slow progression",
      priority: "routine",
    });
  }
  inv.push({
    name: "Serum uric acid",
    rationale: "Hyperuricaemia associated with CKD risk and gout-related nephropathy",
    priority: "consider",
  });
  inv.push({
    name: "Calcium, phosphate, PTH",
    rationale: "CKD-MBD (mineral bone disorder) screening — relevant if eGFR suspected <60",
    priority: riskLevel === "very-high" ? "urgent" : "consider",
  });

  return inv;
}

function buildInterpretation(probability: number, riskLevel: string, factorCount: number): string {
  if (riskLevel === "low") {
    return `The estimated probability of kidney disease is ${probability}%. Based on the entered clinical profile, the risk appears low. Routine kidney function monitoring is still advisable, particularly for patients with any metabolic risk factors. This estimate is derived from population-level epidemiological data.`;
  }
  if (riskLevel === "moderate") {
    return `The estimated probability of kidney disease is ${probability}%. The clinical profile shows a moderate risk based on ${factorCount} contributing factor${factorCount !== 1 ? "s" : ""}. Basic renal function investigations are recommended to characterise the risk further and establish a baseline.`;
  }
  if (riskLevel === "high") {
    return `The estimated probability of kidney disease is ${probability}%. The clinical profile reveals a high-risk pattern with ${factorCount} contributing factor${factorCount !== 1 ? "s" : ""}. Prompt investigation and nephrology review should be considered.`;
  }
  return `The estimated probability of kidney disease is ${probability}%. The clinical profile is strongly consistent with significant kidney disease based on ${factorCount} contributing factor${factorCount !== 1 ? "s" : ""}. Urgent renal workup and specialist referral are recommended.`;
}
