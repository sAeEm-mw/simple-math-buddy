import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Search, ShoppingBag, Droplet, TrendingUp, ArrowUpRight } from "lucide-react";

const AdminDashboard = () => {
  const [m, setM] = useState({ searches: 0, orders: 0, gmv: 0, donors: 0 });

  useEffect(() => {
    (async () => {
      const [s, o, d] = await Promise.all([
        supabase.from("search_logs").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("blood_request_responses").select("id", { count: "exact", head: true }),
      ]);
      const orders = (o.data ?? []) as any[];
      setM({
        searches: s.count ?? 0,
        orders: orders.length,
        gmv: orders.reduce((sum, x) => sum + Number(x.total), 0),
        donors: d.count ?? 0,
      });
    })();
  }, []);

  const tiles = [
    { label: "Total searches", value: m.searches.toLocaleString(), icon: Search, color: "text-primary bg-primary-soft", trend: "+12%" },
    { label: "Active orders", value: m.orders.toLocaleString(), icon: ShoppingBag, color: "text-accent bg-accent-soft", trend: "+8%" },
    { label: "GMV", value: `₹${m.gmv.toFixed(0)}`, icon: TrendingUp, color: "text-success bg-success-soft", trend: "+24%" },
    { label: "Donors contacted", value: m.donors.toLocaleString(), icon: Droplet, color: "text-blood bg-blood-soft", trend: "+6%" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide metrics in real time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Card key={t.label} className="p-5 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.color}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                <ArrowUpRight className="h-3 w-3" /> {t.trend}
              </span>
            </div>
            <div className="mt-4 text-3xl font-bold tabular tracking-tight">{t.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
