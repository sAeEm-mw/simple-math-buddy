import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Package, Loader2, Store, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NEXT: Record<string, string> = {
  pending: "confirmed", confirmed: "packed", packed: "dispatched", dispatched: "delivered",
};
const COLOR: Record<string, string> = {
  pending: "bg-muted text-foreground",
  confirmed: "bg-accent-soft text-accent",
  packed: "bg-warning-soft text-warning",
  dispatched: "bg-primary-soft text-primary",
  delivered: "bg-success-soft text-success",
};

const PharmacyOrders = () => {
  const { user } = useAuth();
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (pid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, profiles:patient_id(full_name, phone), order_items(*)")
      .eq("pharmacy_id", pid)
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: ph } = await supabase.from("pharmacies").select("id, name").eq("user_id", user.id).maybeSingle();
      if (!ph) {
        const { data: created } = await supabase.from("pharmacies")
          .insert({ user_id: user.id, name: "My Pharmacy", address: "Add address", city: "Kharghar", lat: 19.047, lng: 73.07 })
          .select("id").single();
        setPharmacyId(created?.id ?? null);
        if (created) await load(created.id);
      } else {
        setPharmacyId(ph.id);
        await load(ph.id);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!pharmacyId) return;
    const ch = supabase.channel("ph-orders")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `pharmacy_id=eq.${pharmacyId}` },
        () => load(pharmacyId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [pharmacyId]);

  const advance = async (o: any) => {
    const next = NEXT[o.status as keyof typeof NEXT]; if (!next) return;
    const { error } = await supabase.from("orders").update({ status: next as "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" }).eq("id", o.id);
    if (error) toast.error(error.message); else toast.success(`Marked ${next}`);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  // Stats
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const dispatchedCount = orders.filter((o) => o.status === "dispatched").length;
  const todayRevenue = orders
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Incoming orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time. Updates appear automatically.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-success/30 bg-success-soft text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> Live
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "To process", value: pendingCount, accent: "text-accent bg-accent-soft" },
          { label: "Out for delivery", value: dispatchedCount, accent: "text-primary bg-primary-soft" },
          { label: "Today's revenue", value: `₹${todayRevenue.toFixed(0)}`, accent: "text-success bg-success-soft" },
        ].map((s) => (
          <Card key={s.label} className="p-4 shadow-soft">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.accent}`}>
              <Package className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-bold tabular tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="p-14 text-center bg-gradient-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">No orders yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Patients can order from your pharmacy via the search page.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o, oi) => (
            <Card key={o.id} className="overflow-hidden p-0 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${oi * 50}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-card-soft p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold tabular">#{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.profiles?.full_name ?? "Patient"} · {format(new Date(o.created_at), "PPp")}
                    </div>
                    {o.delivery_address && (
                      <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {o.delivery_address}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={cn("capitalize", COLOR[o.status] ?? "bg-muted")}>{o.status}</Badge>
              </div>

              <div className="p-5">
                <div className="space-y-1.5 rounded-lg bg-card-soft p-4 text-sm">
                  {o.order_items.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.med_name} <span className="text-muted-foreground">× {it.qty}</span></span>
                      <span className="tabular font-medium">₹{(it.qty * it.unit_price).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-xl font-bold tabular bg-gradient-primary bg-clip-text text-transparent">₹{Number(o.total).toFixed(0)}</div>
                  </div>
                  {NEXT[o.status] && (
                    <Button size="sm" onClick={() => advance(o)} className="gap-1 bg-gradient-cta shadow-glow press">
                      Mark {NEXT[o.status]} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyOrders;
