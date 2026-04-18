import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

const FALLBACK = [
  { query: "Paracetamol", count: 142 },
  { query: "Crocin", count: 118 },
  { query: "Amoxicillin", count: 86 },
  { query: "Cetirizine", count: 72 },
  { query: "Pantoprazole", count: 64 },
  { query: "Vitamin D3", count: 51 },
  { query: "Azithromycin", count: 47 },
  { query: "Metformin", count: 39 },
];

const Analytics = () => {
  const [data, setData] = useState<{ query: string; count: number }[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from("search_logs")
        .select("query")
        .order("created_at", { ascending: false })
        .limit(500);
      const counts: Record<string, number> = {};
      (rows ?? []).forEach((r: any) => { counts[r.query] = (counts[r.query] ?? 0) + 1; });
      const arr = Object.entries(counts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      if (arr.length === 0) {
        setData(FALLBACK); setUsingDemo(true);
      } else {
        setData(arr);
      }
    })();
  }, []);

  const total = data.reduce((s, x) => s + x.count, 0);
  const top = data[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Top searched medicines</h1>
          <p className="mt-1 text-sm text-muted-foreground">What patients in your area are looking for.</p>
        </div>
        {usingDemo && (
          <Badge variant="outline" className="border-warning/30 bg-warning-soft text-warning">Demo data</Badge>
        )}
      </div>

      {/* Summary tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-5 shadow-soft">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="mt-3 text-2xl font-bold tabular tracking-tight">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total searches (last 500)</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-3 truncate text-2xl font-bold tracking-tight">{top?.query ?? "—"}</div>
          <div className="text-xs text-muted-foreground">Top searched</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="mt-3 text-2xl font-bold tabular tracking-tight">{data.length}</div>
          <div className="text-xs text-muted-foreground">Unique medicines</div>
        </Card>
      </div>

      <Card className="p-6 shadow-soft">
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No search data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical" margin={{ left: 30, right: 20, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="query" type="category" width={110} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-lg)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="url(#barFill)" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
