import { useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChartNoAxesCombined,
  ExternalLink,
  Mail,
  Info,
  Route,
  ShieldCheck,
  Ship,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { CorporateForecastChart } from "@/components/charts/corporate-forecast-chart";
import { codeLabel, formatCurrency, formatDate, yesterdayUtcDate } from "@/lib/format";
import type {
  AdvisoryAction,
  AdvisoryRead,
  CorporateIntent,
  WizardAnswerValue,
  WizardQuestionRead,
  WizardResultRead,
  WizardStepRead,
} from "@/types/domain";

const PILLARS: {
  intent: CorporateIntent;
  title: string;
  eyebrow: string;
  detail: string;
  icon: typeof ChartNoAxesCombined;
}[] = [
  {
    intent: "GROW",
    title: "Grow",
    eyebrow: "Pilar pertumbuhan",
    detail: "Tingkatkan volume penjualan, margin keuntungan, dan penetrasi pasar.",
    icon: ChartNoAxesCombined,
  },
  {
    intent: "EXPORT",
    title: "Ekspor",
    eyebrow: "Pilar perdagangan luar negeri",
    detail: "Kelola pembayaran, dokumen, dan pembiayaan piutang ekspor.",
    icon: Ship,
  },
  {
    intent: "MANAGE_OPERATIONS",
    title: "Manage Operasi",
    eyebrow: "Pilar ketahanan dan efisiensi",
    detail: "Kelola biaya operasional, modal kerja, dan risiko arus kas.",
    icon: SlidersHorizontal,
  },
];

const actionLabel: Record<AdvisoryAction, string> = {
  LEARN_MORE: "Pelajari lebih lanjut",
  CONTACT_RM: "Hubungi Relationship Manager",
  REQUEST_RECEIVABLE_FINANCING: "Ajukan pembiayaan piutang",
  REQUEST_PAYMENT_SCHEDULING: "Ajukan penjadwalan pembayaran",
  REQUEST_LIQUIDITY_REVIEW: "Ajukan tinjauan likuiditas",
};

function runwayLabel(home: { runway_days: number | null; runway_status: string }): string {
  if (home.runway_status === "ADEQUATE_WITHIN_HORIZON" || home.runway_days == null) {
    return "Tidak ada proyeksi di bawah ambang dalam horizon ini";
  }
  return `Sekitar ${home.runway_days} hari lagi`;
}

// ── Home ─────────────────────────────────────────────────────────────────────

export function CorporateHomePage() {
  const asOfDate = yesterdayUtcDate();
  const home = useQuery({
    queryKey: ["corporate-home", asOfDate],
    queryFn: () => api.corporateHome(asOfDate),
  });

  if (home.isLoading) return <LoadingState />;
  if (home.isError || !home.data)
    return (
      <ErrorState
        message="Ringkasan perusahaan belum dapat dimuat. Backend mungkin belum memiliki cukup histori saldo (dibutuhkan 84 hari lengkap)."
        onRetry={() => void home.refetch()}
      />
    );

  const data = home.data;
  const forecast = data.forecast;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#7c8da3]">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-[#10243e]">{data.company_ref}</h1>
        <p className="mt-1 text-sm text-[#6e7f94]">Data per {formatDate(asOfDate)}, dihitung backend dari saldo dan jadwal kas perusahaan.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Saldo kas saat ini" value={formatCurrency(data.current_cash)} icon={<WalletCards size={18} />} />
        <Stat
          label="Runway likuiditas"
          value={runwayLabel(data)}
          icon={<Route size={18} />}
          tone={data.runway_status === "AT_RISK" ? "danger" : "teal"}
        />
        <Stat label="Piutang tertunda" value={formatCurrency(data.receivables)} icon={<ArrowDownLeft size={18} />} />
        <Stat label="Kewajiban tertunda" value={formatCurrency(data.payables)} icon={<ArrowUpRight size={18} />} />
      </section>

      <Card className="border-[#dfe7f2] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#173b68]">Proyeksi arus kas {forecast.horizon_days} hari</h2>
            <p className="mt-1 text-xs text-[#7c8da3]">
              Metode {forecast.method_version} · pita bukan interval kepercayaan statistik, melainkan {" "}
              skenario waktu penerimaan pembayaran.
            </p>
          </div>
          <Badge tone={data.runway_status === "AT_RISK" ? "danger" : "success"}>
            {data.runway_status === "AT_RISK" ? "Berpotensi di bawah ambang" : "Dalam ambang aman"}
          </Badge>
        </div>
        <div className="mt-5">
          <CorporateForecastChart points={forecast.points} threshold={forecast.threshold} />
        </div>
        <ul className="mt-4 space-y-1 text-xs text-[#7c8da3]">
          {forecast.assumptions.map((assumption) => (
            <li key={assumption} className="flex gap-1.5">
              <Info size={13} className="mt-0.5 shrink-0" />
              <span>{assumption}</span>
            </li>
          ))}
        </ul>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#dfe7f2] p-6">
          <p className="text-xs font-semibold uppercase text-[#7c8da3]">Item kas mendatang</p>
          <p className="mt-2 text-2xl font-bold text-[#173b68]">{data.pending_items_count}</p>
          <p className="mt-1 text-xs text-[#6e7f94]">{data.urgent_items_count} jatuh tempo dalam 3 hari</p>
          <Link to="/corporate/invoices" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f26522]">
            Lihat rincian <ArrowRight size={15} />
          </Link>
        </Card>
        <Card className="border-[#dfe7f2] p-6">
          <p className="text-xs font-semibold uppercase text-[#7c8da3]">Volume transaksi 12 bulan</p>
          <p className="mt-2 text-2xl font-bold text-[#173b68]">
            {data.cashflow_volume_12m_status === "AVAILABLE" && data.cashflow_volume_12m != null
              ? formatCurrency(data.cashflow_volume_12m)
              : "Belum tersedia"}
          </p>
          <p className="mt-1 text-xs text-[#6e7f94]">
            {data.cashflow_volume_12m_status === "AVAILABLE"
              ? "Total transaksi settled 365 hari terakhir"
              : "Histori rekening belum mencakup 12 bulan penuh"}
          </p>
        </Card>
      </section>

      <div className="flex justify-end">
        <Link to="/corporate/advisory">
          <Button>
            Konsultasi AI Advisory <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "ink" | "teal" | "danger";
}) {
  const toneClass = { ink: "text-[#173b68]", teal: "text-[#087d70]", danger: "text-red-600" }[tone];
  return (
    <Card className="border-[#dfe7f2] p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf1fb] text-[#2b65a0]">{icon}</span>
      <p className="mt-4 text-xs font-semibold text-[#6e7f94]">{label}</p>
      <p className={`mt-2 text-xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

// ── Advisory: pillar select -> wizard -> result ─────────────────────────────

type WizardPhase = "SELECT" | "QUESTION" | "RESULT" | "INSUFFICIENT";

export function CorporateAdvisoryPage() {
  const asOfDate = yesterdayUtcDate();
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState<CorporateIntent>("GROW");
  const [phase, setPhase] = useState<WizardPhase>("SELECT");
  const [answers, setAnswers] = useState<WizardAnswerValue[]>([]);
  const [question, setQuestion] = useState<WizardQuestionRead | null>(null);
  const [progress, setProgress] = useState<{ answered: number; minimum_questions: number; maximum_questions: number } | null>(null);
  const [completionReason, setCompletionReason] = useState<string | null>(null);
  const [result, setResult] = useState<WizardResultRead | null>(null);

  const advisories = useQuery({
    queryKey: ["corporate-advisories", asOfDate],
    queryFn: () => api.corporateAdvisories(asOfDate),
  });

  const actionMutation = useMutation({
    mutationFn: ({ advisoryId, action }: { advisoryId: string; action: AdvisoryAction }) =>
      api.corporateAdvisoryAction(advisoryId, action),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["corporate-activity"] }),
  });

  function applyStep(step: WizardStepRead) {
    if (step.status === "QUESTION" && step.question) {
      setQuestion(step.question);
      setProgress(step.progress);
      setPhase("QUESTION");
      return;
    }
    setCompletionReason(step.completion_reason);
    void resultMutation.mutateAsync();
  }

  const startMutation = useMutation({
    mutationFn: () => api.corporateWizardStart({ as_of_date: asOfDate, intent }),
    onSuccess: applyStep,
  });

  const nextMutation = useMutation({
    mutationFn: (nextAnswers: WizardAnswerValue[]) =>
      api.corporateWizardNext({ as_of_date: asOfDate, intent, answers: nextAnswers }),
    onSuccess: applyStep,
  });

  const resultMutation = useMutation({
    mutationFn: () => api.corporateWizardResult({ as_of_date: asOfDate, intent, answers }),
    onSuccess: (data) => {
      setResult(data);
      setPhase(data.status === "AVAILABLE" ? "RESULT" : "INSUFFICIENT");
    },
  });

  function restart() {
    setPhase("SELECT");
    setAnswers([]);
    setQuestion(null);
    setProgress(null);
    setResult(null);
    setCompletionReason(null);
  }

  function submitAnswer(value: boolean | string | number) {
    if (!question) return;
    const nextAnswers = [...answers, { question_id: question.question_id, value }];
    setAnswers(nextAnswers);
    void nextMutation.mutateAsync(nextAnswers);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#7c8da3]">Dashboard / AI Advisory</p>
        <h1 className="mt-2 text-3xl font-bold text-[#10243e]">
          {phase === "SELECT" ? "Mau fokus ke bidang apa?" : PILLARS.find((p) => p.intent === intent)?.title}
        </h1>
      </div>

      {phase === "SELECT" && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ intent: pillarIntent, eyebrow, title, detail, icon: Icon }) => {
              const active = intent === pillarIntent;
              return (
                <button
                  key={pillarIntent}
                  type="button"
                  onClick={() => setIntent(pillarIntent)}
                  className={`relative min-h-56 rounded-2xl border bg-white p-6 text-left transition ${active ? "border-[#f26522] shadow-[0_8px_24px_rgba(242,101,34,0.12)]" : "border-[#e2e8f1] hover:border-[#a9bdd6]"}`}
                >
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${active ? "bg-[#f26522] text-white" : "bg-[#eaf1fb] text-[#1d5f9f]"}`}>
                    <Icon size={22} />
                  </span>
                  <span className={`absolute right-6 top-6 grid h-5 w-5 place-items-center rounded-full border ${active ? "border-[#f26522] bg-[#f26522] text-white" : "border-[#afc3dd] bg-[#eaf1fb]"}`}>
                    {active ? <Check size={12} /> : null}
                  </span>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#536d91]">{eyebrow}</p>
                  <h2 className="mt-1 text-xl font-bold text-[#10243e]">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#62758f]">{detail}</p>
                </button>
              );
            })}
          </section>
          {startMutation.isError && (
            <ErrorState message="Sesi konsultasi belum dapat dimulai." onRetry={() => void startMutation.mutateAsync()} />
          )}
          <div className="flex justify-end">
            <Button onClick={() => void startMutation.mutateAsync()} disabled={startMutation.isPending}>
              {startMutation.isPending ? "Memuat pertanyaan..." : "Lanjutkan"} <ArrowRight size={16} />
            </Button>
          </div>
        </>
      )}

      {phase === "QUESTION" && question && progress && (
        <WizardQuestionCard
          question={question}
          progress={progress}
          submitting={nextMutation.isPending}
          onAnswer={submitAnswer}
          onRestart={restart}
        />
      )}

      {phase === "INSUFFICIENT" && (
        <Card className="border-[#dfe7f2] p-6">
          <EmptyState
            title="Belum ada evidence yang cukup"
            detail={completionReason ?? result?.reason ?? "Backend belum menemukan pola yang cukup kuat untuk pilar ini."}
          />
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={restart}>
              Pilih pilar lain
            </Button>
          </div>
        </Card>
      )}

      {phase === "RESULT" && result?.recommendation && (
        <WizardResultCard result={result} recommendation={result.recommendation} onRestart={restart} />
      )}

      <Card className="border-[#dfe7f2] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#173b68]">Advisory berbasis proyeksi arus kas</h2>
          <Badge tone="info">Dari forecast 30 hari</Badge>
        </div>
        <p className="mt-1 text-xs text-[#7c8da3]">
          Daftar ini terpisah dari sesi konsultasi di atas - dihasilkan langsung dari proyeksi arus kas saat ini.
        </p>
        <div className="mt-4">
          {advisories.isLoading ? (
            <LoadingState />
          ) : advisories.isError ? (
            <ErrorState message="Advisory belum dapat dimuat." onRetry={() => void advisories.refetch()} />
          ) : advisories.data && advisories.data.length > 0 ? (
            <div className="space-y-3">
              {advisories.data.map((advisory) => (
                <AdvisoryCard
                  key={advisory.id}
                  advisory={advisory}
                  onAction={(action) => actionMutation.mutate({ advisoryId: advisory.id, action })}
                  pending={actionMutation.isPending && actionMutation.variables?.advisoryId === advisory.id}
                  result={actionMutation.data && actionMutation.variables?.advisoryId === advisory.id ? actionMutation.data : null}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada advisory" detail="Tidak ada peringatan atau rekomendasi dari proyeksi arus kas saat ini." />
          )}
        </div>
      </Card>
    </div>
  );
}

function WizardQuestionCard({
  question,
  progress,
  submitting,
  onAnswer,
  onRestart,
}: {
  question: WizardQuestionRead;
  progress: { answered: number; minimum_questions: number; maximum_questions: number };
  submitting: boolean;
  onAnswer: (value: boolean | string | number) => void;
  onRestart: () => void;
}) {
  const [decimalValue, setDecimalValue] = useState("");
  const [textValue, setTextValue] = useState("");

  return (
    <Card className="border-[#dfe7f2] p-6">
      <div className="flex items-center justify-between text-xs text-[#7c8da3]">
        <span>
          Pertanyaan ke-{progress.answered + 1} · minimum {progress.minimum_questions}, maksimum {progress.maximum_questions}
        </span>
        <button type="button" onClick={onRestart} className="font-semibold text-[#536d91] hover:text-[#173b68]">
          Ganti pilar
        </button>
      </div>
      <h2 className="mt-3 text-xl font-bold text-[#10243e]">{question.prompt}</h2>
      <p className="mt-2 flex items-start gap-1.5 text-xs text-[#7c8da3]">
        <Info size={13} className="mt-0.5 shrink-0" />
        {question.selection_reason}
      </p>

      <div className="mt-6">
        {question.answer_type === "BOOLEAN" && (
          <div className="flex gap-3">
            <Button disabled={submitting} onClick={() => onAnswer(true)}>
              Ya
            </Button>
            <Button variant="secondary" disabled={submitting} onClick={() => onAnswer(false)}>
              Tidak
            </Button>
          </div>
        )}
        {question.answer_type === "SINGLE_CHOICE" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={submitting}
                onClick={() => onAnswer(option)}
                className="rounded-xl border border-[#e2e8f1] bg-white p-4 text-left text-sm font-semibold text-[#173b68] transition hover:border-[#f26522] disabled:opacity-50"
              >
                {codeLabel(option)}
              </button>
            ))}
          </div>
        )}
        {question.answer_type === "DECIMAL" && (
          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (decimalValue.trim() === "") return;
              onAnswer(Number(decimalValue));
              setDecimalValue("");
            }}
          >
            <input
              type="number"
              inputMode="decimal"
              value={decimalValue}
              onChange={(event) => setDecimalValue(event.target.value)}
              className="min-h-11 w-48 rounded-xl border border-line px-4 text-sm outline-none focus:border-[#f26522]"
              placeholder="0"
            />
            {question.unit && <span className="text-sm text-[#6e7f94]">{codeLabel(question.unit)}</span>}
            <Button type="submit" disabled={submitting || decimalValue.trim() === ""}>
              Kirim
            </Button>
          </form>
        )}
        {question.answer_type === "TEXT" && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (textValue.trim() === "") return;
              onAnswer(textValue.trim());
              setTextValue("");
            }}
          >
            <textarea
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-line p-4 text-sm outline-none focus:border-[#f26522]"
            />
            <Button type="submit" disabled={submitting || textValue.trim() === ""}>
              Kirim
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

function WizardResultCard({
  result,
  recommendation,
  onRestart,
}: {
  result: WizardResultRead;
  recommendation: NonNullable<WizardResultRead["recommendation"]>;
  onRestart: () => void;
}) {
  return (
    <Card className="border-[#dfe7f2] p-6">
      <Badge tone="info">Hasil konsultasi · {result.answered_question_ids.length} pertanyaan dijawab</Badge>
      <h2 className="mt-3 text-2xl font-bold text-[#10243e]">{recommendation.title}</h2>
      <p className="mt-2 leading-7 text-[#4a5b73]">{recommendation.explanation}</p>

      <div className="mt-5 rounded-xl bg-[#f5f8fc] p-4">
        <p className="text-xs font-bold uppercase text-[#7c8da3]">Langkah yang direkomendasikan</p>
        <p className="mt-1 text-sm font-semibold text-[#173b68]">{recommendation.recommended_action}</p>
      </div>

      {recommendation.product_match && (
        <div className="mt-5 rounded-xl border border-[#dae5f4] bg-[#edf4ff] p-4">
          <p className="text-xs font-bold uppercase text-[#536d91]">Produk terkait</p>
          <p className="mt-1 font-bold text-[#173b68]">{recommendation.product_match.name}</p>
          <p className="mt-1 text-sm text-[#4a5b73]">{recommendation.product_match.why_this_product}</p>
          <p className="mt-2 text-xs text-[#7c8da3]">{recommendation.product_match.eligibility}</p>
          <a
            href={recommendation.product_match.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#f26522]"
          >
            Lihat halaman produk <ExternalLink size={14} />
          </a>
        </div>
      )}

      {recommendation.next_actions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase text-[#7c8da3]">Langkah lanjutan yang tersedia</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendation.next_actions.map((action) => (
              <Badge key={action} tone="neutral">
                {actionLabel[action]}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#9aa8b8]">
            Hubungi Relationship Manager Anda untuk menindaklanjuti langkah di atas.
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-[#9aa8b8]">{result.disclaimer}</p>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onRestart}>
          Mulai konsultasi baru
        </Button>
      </div>
    </Card>
  );
}

function AdvisoryCard({
  advisory,
  onAction,
  pending,
  result,
}: {
  advisory: AdvisoryRead;
  onAction: (action: AdvisoryAction) => void;
  pending: boolean;
  result: { delivery: string } | null;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f1] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-[#7c8da3]">{codeLabel(advisory.kind)}</p>
          <p className="mt-1 font-semibold text-[#173b68]">{advisory.explanation}</p>
        </div>
        {advisory.amount != null && <p className="font-bold text-[#173b68]">{formatCurrency(advisory.amount)}</p>}
      </div>
      <p className="mt-2 text-sm text-[#62758f]">{advisory.recommended_action}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {advisory.next_actions.map((action) => (
          <Button key={action} variant="secondary" className="text-xs" disabled={pending} onClick={() => onAction(action)}>
            {actionLabel[action]}
          </Button>
        ))}
      </div>
      {result && <p className="mt-2 text-xs text-[#087d70]">{result.delivery}</p>}
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

export function CorporateNotificationsPage() {
  const messages = useQuery({ queryKey: ["corporate-messages"], queryFn: () => api.messages() });
  if (messages.isLoading) return <LoadingState />;
  if (messages.isError || !messages.data) return <ErrorState message="Notifikasi belum dapat dimuat." onRetry={() => void messages.refetch()} />;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#7c8da3]">Dashboard / Notifikasi</p>
        <h1 className="mt-2 text-3xl font-bold text-[#10243e]">Notifikasi perusahaan</h1>
        <p className="mt-1 text-sm text-[#6e7f94]">Pembaruan layanan, penawaran, dan tindak lanjut perusahaan.</p>
      </div>
      {messages.data.items.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" detail="Notifikasi baru dari backend akan muncul di halaman ini." />
      ) : (
        <div className="space-y-3">
          {messages.data.items.map((message) => (
            <Card key={message.id} className="flex gap-4 border-[#dfe7f2] p-5">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${message.response_state === null ? "bg-[#fff1e9] text-[#f26522]" : "bg-[#eaf1f8] text-[#1d5f9f]"}`}>
                <Mail size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-bold text-[#173b68]">{message.title}</h2>
                  {message.response_state ? <Badge tone="info">{codeLabel(message.response_state)}</Badge> : <Badge tone="warning">Baru</Badge>}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#62758f]">{message.body}</p>
                <p className="mt-2 text-xs text-[#9aa8b8]">{formatDate(message.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Cash-flow items ("Tagihan & Invoice") ───────────────────────────────────

const categoryFilters: { value: string; label: string }[] = [
  { value: "", label: "Semua kategori" },
  { value: "RECEIVABLE", label: "Piutang" },
  { value: "EXPORT_RECEIVABLE", label: "Piutang ekspor" },
  { value: "PAYABLE", label: "Tagihan" },
  { value: "PAYROLL", label: "Payroll" },
  { value: "OPERATING", label: "Operasional" },
  { value: "CAPEX", label: "Belanja modal" },
];

export function CorporateInvoicesPage() {
  const asOfDate = yesterdayUtcDate();
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | "PENDING" | "SETTLED">("PENDING");

  const summary = useQuery({ queryKey: ["corporate-summary"], queryFn: api.corporateSummary });
  const forecast = useQuery({
    queryKey: ["corporate-forecast", asOfDate],
    queryFn: () => api.corporateForecast(asOfDate, 30),
  });
  const items = useQuery({
    queryKey: ["corporate-cash-items", asOfDate, category, status],
    queryFn: () =>
      api.corporateCashflowItems({
        as_of_date: asOfDate,
        category: category ? [category as never] : undefined,
        status: status || undefined,
        sort: "DUE_DATE",
        page_size: 20,
      }),
  });

  if (summary.isLoading) return <LoadingState />;
  if (summary.isError || !summary.data) return <ErrorState message="Arus kas belum dapat dimuat." onRetry={() => void summary.refetch()} />;

  const data = summary.data;
  const flow = data.cashflow_totals_30d;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#b45624]">Cashflow monitoring</p>
        <h1 className="mt-1 text-3xl font-bold text-[#10243e]">Tagihan & Invoice</h1>
        <p className="mt-1 text-sm text-[#6e7f94]">Ringkasan arus kas 30 hari dan jadwal kas dari backend perusahaan.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <FlowCard icon={<ArrowDownLeft />} label="Pemasukan (30 hari)" value={formatCurrency(flow.incoming_30d)} tone="teal" />
        <FlowCard icon={<ArrowUpRight />} label="Pengeluaran (30 hari)" value={formatCurrency(flow.outgoing_30d)} tone="orange" />
        <FlowCard icon={<WalletCards />} label="Arus kas bersih (30 hari)" value={formatCurrency(flow.net_cashflow_30d)} tone="blue" />
      </section>

      <Card className="border-[#dfe7f2] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#173b68]">Proyeksi likuiditas</h2>
            <p className="mt-1 text-xs text-[#7c8da3]">Horizon 30 hari, dihitung dari saldo dan jadwal kas backend.</p>
          </div>
          <ShieldCheck size={19} className="text-[#16805c]" />
        </div>
        <div className="mt-5">
          {forecast.isLoading ? (
            <LoadingState />
          ) : forecast.isError || !forecast.data ? (
            <ErrorState message="Proyeksi belum dapat dimuat." onRetry={() => void forecast.refetch()} />
          ) : (
            <CorporateForecastChart points={forecast.data.points} threshold={forecast.data.threshold} />
          )}
        </div>
      </Card>

      <Card className="border-[#dfe7f2] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#173b68]">Daftar tagihan dan piutang</h2>
            {items.data && <Badge tone="neutral">{items.data.total} item</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-9 rounded-lg border border-line bg-white px-3 text-xs"
            >
              {categoryFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "" | "PENDING" | "SETTLED")}
              className="min-h-9 rounded-lg border border-line bg-white px-3 text-xs"
            >
              <option value="">Semua status</option>
              <option value="PENDING">Menunggu</option>
              <option value="SETTLED">Selesai</option>
            </select>
          </div>
        </div>

        {items.data && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f5f8fc] p-4 text-xs sm:grid-cols-4">
            <div>
              <p className="text-[#7c8da3]">Total piutang tertunda</p>
              <p className="mt-1 font-bold text-[#087d70]">{formatCurrency(items.data.totals.receivable_total)}</p>
            </div>
            <div>
              <p className="text-[#7c8da3]">Total tagihan tertunda</p>
              <p className="mt-1 font-bold text-[#c95116]">{formatCurrency(items.data.totals.payable_total)}</p>
            </div>
            <div>
              <p className="text-[#7c8da3]">Item tertunda</p>
              <p className="mt-1 font-bold text-[#173b68]">{items.data.totals.pending_count}</p>
            </div>
            <div>
              <p className="text-[#7c8da3]">Jatuh tempo &le;3 hari</p>
              <p className="mt-1 font-bold text-red-600">{items.data.totals.urgent_count}</p>
            </div>
          </div>
        )}

        <div className="mt-5">
          {items.isLoading ? (
            <LoadingState />
          ) : items.isError || !items.data ? (
            <ErrorState message="Daftar item belum dapat dimuat." onRetry={() => void items.refetch()} />
          ) : items.data.items.length === 0 ? (
            <EmptyState title="Tidak ada item" detail="Tidak ada item kas yang cocok dengan filter saat ini." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase text-[#7c8da3]">
                    <th className="py-2 pr-3 font-semibold">Referensi</th>
                    <th className="py-2 pr-3 font-semibold">Rekanan</th>
                    <th className="py-2 pr-3 font-semibold">Kategori</th>
                    <th className="py-2 pr-3 font-semibold">Jatuh tempo</th>
                    <th className="py-2 pr-3 text-right font-semibold">Nominal</th>
                    <th className="py-2 pl-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 font-semibold text-[#173b68]">{item.reference}</td>
                      <td className="py-3 pr-3 text-[#62758f]">{item.counterparty_ref}</td>
                      <td className="py-3 pr-3 text-[#62758f]">{codeLabel(item.category)}</td>
                      <td className="py-3 pr-3 text-[#62758f]">
                        {formatDate(item.due_date)}
                        {item.status === "PENDING" && (
                          <span className={item.days_to_due <= 3 ? "ml-1 text-red-600" : "ml-1 text-[#9aa8b8]"}>
                            ({item.days_to_due < 0 ? `H+${-item.days_to_due}` : `H-${item.days_to_due}`})
                          </span>
                        )}
                      </td>
                      <td className={`py-3 pr-3 text-right font-semibold ${item.direction === "CREDIT" ? "text-[#087d70]" : "text-[#c95116]"}`}>
                        {item.direction === "CREDIT" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <Badge tone={item.status === "SETTLED" ? "success" : "warning"}>{codeLabel(item.status)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {items.data && <p className="mt-4 text-xs text-[#9aa8b8]">{items.data.disclaimer}</p>}
      </Card>
    </div>
  );
}

function FlowCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "teal" | "orange" | "blue" }) {
  const colors = { teal: "bg-[#e8f8f5] text-[#087d70]", orange: "bg-[#fff1e9] text-[#c95116]", blue: "bg-[#eaf1fb] text-[#2b65a0]" };
  return (
    <Card className="border-[#dfe7f2] p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}>{icon}</span>
      <p className="mt-4 text-xs font-semibold text-[#6e7f94]">{label}</p>
      <p className="mt-2 truncate text-xl font-bold text-[#173b68]">{value}</p>
    </Card>
  );
}
