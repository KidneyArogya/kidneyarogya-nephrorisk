
export default function Disclaimer() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
      <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Clinical Decision-Support Tool — Not a Diagnosis</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Kidney Arogya - NephroRisk</strong> estimates the probability of kidney disease based on real-world epidemiological data (KDIGO, CKD-PC, GBD). It is designed for use by trained clinicians as a supplement to clinical reasoning — <strong>not</strong> as a replacement for history-taking, examination, or investigation. Results must not be used in isolation to diagnose or exclude kidney disease. Always apply clinical judgement and consult relevant guidelines.
        </p>
      </div>
    </div>
  );
}
