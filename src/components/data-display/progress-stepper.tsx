export function ProgressStepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4" aria-label="Tahap pengajuan">
      {steps.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        return <li key={step} className={`rounded-xl border px-3 py-3 text-xs ${complete ? "border-teal-200 bg-teal-50 text-teal-800" : active ? "border-orange-300 bg-orange-50 text-orange-800" : "border-line bg-paper text-slate-500"}`}><span className="font-bold">{index + 1}</span><span className="ml-2 font-semibold">{step}</span></li>;
      })}
    </ol>
  );
}
