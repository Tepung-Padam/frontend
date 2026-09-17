import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface PortfolioRiskPoint {
  name: string;
  value: number;
  color?: string;
}

export function PortfolioRiskChart({ data }: { data: PortfolioRiskPoint[] }) {
  return (
    <div className="h-56" aria-label="Kurva distribusi risiko portfolio">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 4 }}>
          <defs><linearGradient id="portfolioRiskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e87532" stopOpacity={0.34} /><stop offset="95%" stopColor="#e87532" stopOpacity={0.03} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2dc" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => [Number(value), "Nasabah"]} />
          <Area type="monotone" dataKey="value" stroke="#e87532" strokeWidth={3} fill="url(#portfolioRiskFill)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
