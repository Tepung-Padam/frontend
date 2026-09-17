import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "@/types/domain";
import { formatCurrency } from "@/lib/format";

function compactIdr(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(0)}jt`;
  return formatCurrency(value);
}

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: ForecastPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const breach = point.risk_status === "BELOW_THRESHOLD";
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-semibold text-ink">{point.date}</p>
      <p className="mt-1 text-ink">Proyeksi: {formatCurrency(point.projected_balance)}</p>
      <p className="text-[#7c8da3]">
        Skenario: {formatCurrency(point.lower_balance)} - {formatCurrency(point.upper_balance)}
      </p>
      <p className={breach ? "mt-1 font-semibold text-red-600" : "mt-1 font-semibold text-teal-600"}>
        {breach ? "Di bawah ambang minimum" : "Di atas ambang minimum"}
      </p>
    </div>
  );
}

/**
 * Forecast line + scenario band + minimum-threshold reference. The band is the
 * backend's receipt-timing scenario range, not a statistical confidence interval -
 * see ForecastRead.uncertainty_method, surfaced as a caption by the caller.
 */
export function CorporateForecastChart({
  points,
  threshold,
}: {
  points: ForecastPoint[];
  threshold: string;
}) {
  const data = points.map((point) => ({
    ...point,
    projected: Number(point.projected_balance),
    lower: Number(point.lower_balance),
    upper: Number(point.upper_balance),
    band: [Number(point.lower_balance), Number(point.upper_balance)],
  }));
  return (
    <div className="h-72" aria-label="Grafik proyeksi arus kas">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="corpForecastBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e87532" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#e87532" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2dc" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value: string) => value.slice(5)}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            width={56}
            tickFormatter={(value: number) => compactIdr(value)}
          />
          <Tooltip content={<TooltipContent />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            dataKey="band"
            name="Rentang skenario waktu penerimaan"
            stroke="none"
            fill="url(#corpForecastBand)"
            isAnimationActive={false}
          />
          <ReferenceLine
            y={Number(threshold)}
            stroke="#dc2626"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: "Ambang minimum", position: "insideTopRight", fontSize: 10, fill: "#dc2626" }}
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Saldo diproyeksikan"
            stroke="#173b68"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
