import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2, ShoppingBag, CreditCard, Loader2, Minus, Plus, Store, Lock, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { items, remove, clear, total, add } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    (acc[it.pharmacy_id] ??= []).push(it);
    return acc;
  }, {});

  const inc = (i: typeof items[number]) => add({ ...i, qty: 1 });
  const dec = (i: typeof items[number]) => {
    if (i.qty <= 1) { remove(i.med_id, i.pharmacy_id); return; }
    // re-add with -2 then +1 net: simplest, remove and re-add
    remove(i.med_id, i.pharmacy_id);
    for (let n = 0; n < i.qty - 1; n++) add({ ...i, qty: 1 });
  };

  const checkout = async () => {
    if (!user) return toast.error("Please sign in");
    if (!address.trim()) return toast.error("Enter a delivery address");
    setBusy(true);
    try {
      for (const [pharmacy_id, list] of Object.entries(grouped)) {
        const orderTotal = list.reduce((s, i) => s + i.unit_price * i.qty, 0);
        const { data: order, error: oErr } = await supabase
          .from("orders")
          .insert({
            patient_id: user.id, pharmacy_id, total: orderTotal,
            delivery_address: address, status: "confirmed", payment_status: "held",
          })
          .select("id")
          .single();
        if (oErr) throw oErr;
        const { error: iErr } = await supabase.from("order_items").insert(
          list.map((i) => ({
            order_id: order.id, med_id: i.med_id, med_name: i.med_name,
            qty: i.qty, unit_price: i.unit_price,
          })),
        );
        if (iErr) throw iErr;

        const { data: ph } = await supabase.from("pharmacies").select("user_id").eq("id", pharmacy_id).maybeSingle();
        if (ph?.user_id) {
          await supabase.from("notifications").insert({
            user_id: ph.user_id,
            title: "New order received",
            body: `Order of ₹${orderTotal.toFixed(0)} — ${list.length} items`,
            link: "/pharmacy",
          });
        }
      }
      clear();
      toast.success("Payment held in escrow. Orders sent to pharmacies!");
      nav("/app/orders");
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-14 text-center bg-gradient-card animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search for medicines and add them to compare savings.</p>
          <Link to="/app">
            <Button className="mt-6 bg-gradient-cta press shadow-glow">Browse pharmacies</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">{itemCount} items from {Object.keys(grouped).length} pharmacies</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground press">
          Clear all
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {Object.entries(grouped).map(([pid, list], gi) => {
            const subtotal = list.reduce((s, i) => s + i.unit_price * i.qty, 0);
            return (
              <Card key={pid} className="overflow-hidden animate-fade-up shadow-soft" style={{ animationDelay: `${gi * 60}ms` }}>
                <div className="flex items-center gap-2 border-b bg-card-soft px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{list[0].pharmacy_name}</div>
                    <div className="text-[11px] text-muted-foreground">{list.length} item{list.length > 1 ? "s" : ""}</div>
                  </div>
                  <span className="text-sm font-semibold tabular">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="divide-y">
                  {list.map((i) => (
                    <div key={`${i.med_id}-${i.pharmacy_id}`} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{i.med_name}</div>
                        <div className="text-xs text-muted-foreground tabular">₹{i.unit_price.toFixed(0)} each</div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border bg-card-soft p-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7 press" onClick={() => dec(i)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-6 text-center text-sm font-semibold tabular">{i.qty}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 press" onClick={() => inc(i)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-16 text-right font-semibold tabular">₹{(i.qty * i.unit_price).toFixed(0)}</div>
                      <Button size="icon" variant="ghost" className="press text-muted-foreground hover:text-destructive" onClick={() => remove(i.med_id, i.pharmacy_id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="overflow-hidden shadow-elevated">
            <div className="bg-gradient-card p-6">
              <h3 className="font-semibold">Order summary</h3>
              <div className="mt-4 space-y-2">
                <Label htmlFor="addr" className="text-xs font-medium">Delivery address</Label>
                <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, street, area, pincode" maxLength={200} className="h-11" />
              </div>

              <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular">₹{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-medium text-success">FREE</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-primary bg-clip-text text-transparent tabular">₹{total.toFixed(0)}</span>
                </div>
              </div>

              <Button onClick={checkout} disabled={busy} className="mt-5 h-12 w-full bg-gradient-cta shadow-glow press text-base">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {busy ? "Processing..." : "Pay securely"}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Funds held in escrow · released on delivery
              </div>
            </div>
            <div className="flex items-center gap-2 border-t bg-card-soft px-6 py-3 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              You're saving on every item by comparing
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
