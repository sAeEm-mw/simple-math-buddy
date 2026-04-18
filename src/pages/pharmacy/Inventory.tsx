import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pill, Search, Package } from "lucide-react";

const Inventory = () => {
  const { user } = useAuth();
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: ph } = await supabase.from("pharmacies").select("id").eq("user_id", user.id).maybeSingle();
      if (!ph) return;
      setPharmacyId(ph.id);
      const { data } = await supabase
        .from("pharmacy_inventory")
        .select("id, price, stock_count, meds(name, generic_name, mrp)")
        .eq("pharmacy_id", ph.id);
      setItems(data ?? []);
    })();
  }, [user?.id]);

  const update = async (id: string, field: "price" | "stock_count", value: number) => {
    const payload = field === "price" ? { price: value } : { stock_count: value };
    const { error } = await supabase.from("pharmacy_inventory").update(payload).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Updated");
  };

  const filtered = items.filter((it: any) =>
    !q || (it.meds?.name ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const lowStock = items.filter((it) => it.stock_count <= 10).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} medicines · update prices and stock anytime.</p>
        </div>
        {lowStock > 0 && (
          <Badge variant="outline" className="border-warning/30 bg-warning-soft text-warning">
            ⚠ {lowStock} low stock
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your inventory..." className="h-11 pl-10" />
      </div>

      <Card className="overflow-hidden shadow-soft">
        <div className="hidden grid-cols-[1fr_140px_120px] gap-4 border-b bg-card-soft px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid">
          <div>Medicine</div>
          <div>Price (₹)</div>
          <div>Stock</div>
        </div>
        <div className="divide-y">
          {filtered.map((it: any) => {
            const low = it.stock_count <= 10;
            return (
              <div key={it.id} className="grid grid-cols-1 gap-3 p-4 transition-base hover:bg-card-soft sm:grid-cols-[1fr_140px_120px] sm:items-center sm:gap-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{it.meds?.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{it.meds?.generic_name} · MRP ₹{it.meds?.mrp}</div>
                  </div>
                </div>
                <Input type="number" defaultValue={Number(it.price)} className="h-9 tabular"
                  onBlur={(e) => update(it.id, "price", Number(e.target.value))} />
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={it.stock_count} className={`h-9 tabular ${low ? "border-warning/40 text-warning" : ""}`}
                    onBlur={(e) => update(it.id, "stock_count", Number(e.target.value))} />
                  {low && <span className="text-[10px] font-bold uppercase text-warning">Low</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">{q ? "No matches" : "No inventory yet."}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Inventory;
