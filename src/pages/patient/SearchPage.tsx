import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { haversineKm } from "@/lib/distance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Loader2, Store, Phone, Navigation,
  Plus, Sparkles, ShoppingCart, Tag, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Medicine { name: string; price: number; }
interface Pharmacy {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  is_open: boolean;
  rating: number;
  delivery_min: number;
  medicines: Medicine[];
  distance_km?: number;
  matchedMed?: Medicine;
}

const ALL_PHARMACIES: Pharmacy[] = [
  { id: "1", name: "Apollo Pharmacy", address: "Sector 7, Kharghar", phone: "9876543210",
    lat: 19.046, lng: 73.070, is_open: true, rating: 4.7, delivery_min: 25,
    medicines: [{ name: "Paracetamol", price: 25 }, { name: "Crocin", price: 30 }, { name: "Amoxicillin", price: 95 }, { name: "Azithromycin", price: 110 }] },
  { id: "2", name: "MedPlus", address: "Sector 12, Kharghar", phone: "9123456780",
    lat: 19.049, lng: 73.065, is_open: true, rating: 4.5, delivery_min: 30,
    medicines: [{ name: "Paracetamol", price: 22 }, { name: "Crocin", price: 28 }, { name: "Cetirizine", price: 18 }] },
  { id: "3", name: "Wellness Forever", address: "Sector 20, Kharghar", phone: "9988776655",
    lat: 19.052, lng: 73.072, is_open: false, rating: 4.4, delivery_min: 45,
    medicines: [{ name: "Paracetamol", price: 30 }, { name: "Vitamin D3", price: 220 }] },
  { id: "4", name: "Guardian Pharmacy", address: "Sector 10, Kharghar", phone: "9765432109",
    lat: 19.045, lng: 73.068, is_open: true, rating: 4.6, delivery_min: 20,
    medicines: [{ name: "Paracetamol", price: 24 }, { name: "Pantoprazole", price: 65 }] },
];

const QUICK = ["Paracetamol", "Crocin", "Amoxicillin", "Cetirizine", "Vitamin D3"];

const SearchPage = () => {
  const { add, items } = useCart();
  const nav = useNavigate();
  const coords = { lat: 19.047, lng: 73.069 };

  const [q, setQ] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  const fetchPharmacies = useCallback(async (query: string = "") => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 350));

    let filtered: Pharmacy[];
    if (query.trim()) {
      filtered = ALL_PHARMACIES
        .map((p) => {
          const match = p.medicines.find((m) => m.name.toLowerCase().includes(query.toLowerCase()));
          if (!match) return null;
          return { ...p, matchedMed: match };
        })
        .filter(Boolean) as Pharmacy[];
    } else {
      filtered = ALL_PHARMACIES;
    }

    const decorated = filtered
      .map((p) => ({ ...p, distance_km: haversineKm(coords.lat, coords.lng, p.lat, p.lng) }))
      .sort((a, b) =>
        query.trim()
          ? (a.matchedMed?.price ?? 999) - (b.matchedMed?.price ?? 999)
          : (a.distance_km ?? 0) - (b.distance_km ?? 0)
      );

    setPharmacies(decorated);
    setActiveQuery(query.trim());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPharmacies(); }, [fetchPharmacies]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchPharmacies(q); };

  const cheapestPrice = useMemo(() =>
    pharmacies.reduce((m, p) => (p.matchedMed && p.matchedMed.price < m ? p.matchedMed.price : m), Infinity),
    [pharmacies]
  );

  const inCart = (pid: string, med: string) =>
    items.some((i) => i.pharmacy_id === pid && i.med_name === med);

  const handleAdd = (p: Pharmacy) => {
    if (!p.matchedMed) {
      toast.info("Search a medicine first to add to cart");
      return;
    }
    if (!p.is_open) {
      toast.error("This pharmacy is currently closed");
      return;
    }
    add({
      med_id: `${p.id}-${p.matchedMed.name}`,
      med_name: p.matchedMed.name,
      pharmacy_id: p.id,
      pharmacy_name: p.name,
      unit_price: p.matchedMed.price,
      qty: 1,
    });
    toast.success(`Added ${p.matchedMed.name} to cart`, {
      action: { label: "View cart", onClick: () => nav("/app/cart") },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find medicines nearby</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compare prices across verified pharmacies in your area.</p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground md:inline-flex">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Kharghar, Mumbai
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search any medicine — e.g. Paracetamol"
              className="h-14 rounded-2xl border-2 pl-11 pr-4 text-base shadow-soft transition-base focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="h-14 rounded-2xl bg-gradient-cta px-7 shadow-glow press">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Popular:</span>
          {QUICK.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setQ(s); fetchPharmacies(s); }}
              className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-base hover:border-primary hover:bg-primary-soft hover:text-primary press"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Results header */}
      {activeQuery && !loading && pharmacies.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary-soft px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span><strong className="text-primary">{pharmacies.length}</strong> pharmacies stock <strong>{activeQuery}</strong></span>
          </div>
          {cheapestPrice !== Infinity && (
            <span className="text-sm font-semibold text-primary tabular">From ₹{cheapestPrice}</span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="surface h-56 shimmer" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && pharmacies.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-lg font-semibold">No pharmacies stock that medicine</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or browse all pharmacies.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setQ(""); fetchPharmacies(); }}>
            Clear search
          </Button>
        </Card>
      )}

      {/* Results grid */}
      {!loading && pharmacies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {pharmacies.map((p, i) => {
            const isBest = p.matchedMed?.price === cheapestPrice && cheapestPrice !== Infinity;
            const added = p.matchedMed ? inCart(p.id, p.matchedMed.name) : false;
            return (
              <Card
                key={p.id}
                className={cn(
                  "group relative overflow-hidden p-5 transition-base hover-lift animate-fade-up",
                  isBest ? "border-primary/40 ring-2 ring-primary/20" : "",
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {isBest && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-cta px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                    ★ Best price
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold leading-tight">{p.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.address}</p>
                    </div>
                  </div>
                </div>

                {/* Status row */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 border px-2 py-0.5",
                      p.is_open
                        ? "border-success/30 bg-success-soft text-success"
                        : "border-destructive/30 bg-destructive/10 text-destructive",
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.is_open ? "bg-success pulse-dot" : "bg-destructive")} />
                    {p.is_open ? "Open now" : "Closed"}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border bg-card px-2 py-0.5 text-muted-foreground">
                    <Navigation className="h-3 w-3" /> {p.distance_km?.toFixed(1)} km
                  </Badge>
                  <Badge variant="outline" className="gap-1 border bg-card px-2 py-0.5 text-muted-foreground">
                    <Clock className="h-3 w-3" /> ~{p.delivery_min} min
                  </Badge>
                </div>

                {/* Price */}
                {p.matchedMed && (
                  <div className="mt-4 flex items-end justify-between rounded-xl border bg-card-soft px-4 py-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.matchedMed.name}</div>
                      <div className={cn("mt-0.5 text-3xl font-bold tabular tracking-tight", isBest ? "text-primary" : "text-foreground")}>
                        ₹{p.matchedMed.price}
                      </div>
                    </div>
                    {isBest && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <Tag className="h-3 w-3" /> Lowest
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 press"
                    onClick={() =>
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, "_blank")
                    }
                  >
                    <Navigation className="mr-1.5 h-3.5 w-3.5" /> Directions
                  </Button>
                  {p.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="press"
                      onClick={() => window.open(`tel:${p.phone}`)}
                      aria-label="Call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {p.matchedMed ? (
                    <Button
                      size="sm"
                      onClick={() => handleAdd(p)}
                      disabled={!p.is_open}
                      className={cn("flex-1 press", added ? "bg-success hover:bg-success/90" : "bg-gradient-cta shadow-glow")}
                    >
                      {added ? (
                        <><ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> In cart</>
                      ) : (
                        <><Plus className="mr-1.5 h-3.5 w-3.5" /> Add</>
                      )}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="flex-1 press" onClick={() => toast.info("Search a medicine to add it from this pharmacy")}>
                      Browse
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
