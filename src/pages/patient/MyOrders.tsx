import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Package, Store, CheckCircle2, Truck, Box, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "pending",    label: "Pending",    icon: Clock },
  { key: "confirmed",  label: "Confirmed",  icon: CheckCircle2 },
  { key: "packed",     label: "Packed",     icon: Box },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: Package },
];

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-muted text-foreground",
  confirmed:  "bg-accent-soft text-accent",
  packed:     "bg-warning-soft text-warning",
  dispatched: "bg-primary-soft text-primary",
  delivered:  "bg-success-soft text-success",
  cancelled:  "bg-destructive/10 text-destructive",
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, pharmacies(name), order_items(*)")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("patient-orders")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `patient_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const markReceived = async (id: string) => {
    const { error } = await supabase.from("orders")
      .update({ status: "delivered", payment_status: "released" }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Marked as received. Funds released to pharmacy.");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {[0,1,2].map((i) => <div key={i} className="surface h-44 shimmer" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-14 text-center bg-gradient-card animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Once you place an order, it'll show up here with live tracking.</p>
          <Link to="/app">
            <Button className="mt-6 bg-gradient-cta press shadow-glow">Browse pharmacies</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} order{orders.length > 1 ? "s" : ""} · live status updates</p>
      </div>

      {orders.map((o, oi) => {
        const stageIdx = STAGES.findIndex((s) => s.key === o.status);
        const cancelled = o.status === "cancelled";
        return (
          <Card key={o.id} className="overflow-hidden p-0 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${oi * 50}ms` }}>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-card-soft p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{o.pharmacies?.name ?? "Pharmacy"}</div>
                  <div className="text-xs text-muted-foreground tabular">
                    {format(new Date(o.created_at), "PPp")} · #{o.id.slice(0, 8)}
                  </div>
                </div>
              </div>
              <Badge className={cn("capitalize", STATUS_STYLE[o.status] ?? "bg-muted")}>
                {cancelled && <XCircle className="mr-1 h-3 w-3" />}
                {o.status}
              </Badge>
            </div>

            <div className="p-5">
              {/* Progress tracker */}
              {!cancelled && (
                <div className="relative">
                  <div className="flex items-center">
                    {STAGES.map((s, i) => {
                      const reached = i <= stageIdx;
                      const Icon = s.icon;
                      return (
                        <div key={s.key} className="flex flex-1 flex-col items-center first:items-start last:items-end">
                          <div className={cn(
                            "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-base",
                            reached ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-card text-muted-foreground"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={cn(
                            "mt-1.5 text-[10px] font-medium uppercase tracking-wider",
                            reached ? "text-primary" : "text-muted-foreground"
                          )}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* connector line */}
                  <div className="absolute left-[18px] right-[18px] top-[18px] -z-0 h-0.5 bg-border" />
                  <div
                    className="absolute left-[18px] top-[18px] h-0.5 bg-gradient-primary transition-all duration-700"
                    style={{ width: `calc((100% - 36px) * ${Math.max(0, stageIdx) / (STAGES.length - 1)})` }}
                  />
                </div>
              )}

              {/* Items */}
              <div className="mt-5 space-y-1.5 rounded-lg bg-card-soft p-4 text-sm">
                {o.order_items.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.med_name} <span className="text-muted-foreground">× {it.qty}</span></span>
                    <span className="tabular font-medium">₹{(it.qty * it.unit_price).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-lg font-bold tabular bg-gradient-primary bg-clip-text text-transparent">
                    ₹{Number(o.total).toFixed(0)}
                  </div>
                </div>
                {o.status === "dispatched" && (
                  <Button size="sm" onClick={() => markReceived(o.id)} className="bg-gradient-cta press shadow-glow">
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark received
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MyOrders;
