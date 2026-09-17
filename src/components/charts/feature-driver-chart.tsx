import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface FeatureDriverPoint {
  label: string;
  customer_count: number;
}

export function FeatureDriverChart({ data }: { data: FeatureDriverPoint[] }) {
  return (
    <div className="h-72" aria-label="Faktor risiko model">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 76, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e3e2dc" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="label" width={180} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: "#f6f5f1" }} formatter={(value) => [Number(value), "Nasabah"]} />
          <Bar dataKey="customer_count" fill="#167b76" radius={[0, 7, 7, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
