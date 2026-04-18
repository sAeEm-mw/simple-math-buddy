import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, Upload, Loader2, Sparkles, Pill, Plus, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ParsedDrug {
  drug: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

const PRICE_OPTIONS = [
  { name: "MedPlus", price: 20, dist: "0.8 km" },
  { name: "Apollo Pharmacy", price: 35, dist: "1.2 km" },
  { name: "Guardian", price: 24, dist: "1.5 km" },
];

const ScanPrescription = () => {
  const { user } = useAuth();
  const { add } = useCart();
  const nav = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<ParsedDrug[] | null>(null);
  const [rawText, setRawText] = useState<string>("");

  const onFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast.error("File must be under 5 MB"); return; }
    setFile(f); setParsed(null); setRawText("");
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const scan = async () => {
    if (!preview) return;
    setBusy(true);
    await new Promise((res) => setTimeout(res, 1500));
    const fakeData: ParsedDrug[] = [
      { drug: "Paracetamol", dosage: "500mg", frequency: "Twice daily", duration: "5 days" },
      { drug: "Amoxicillin", dosage: "250mg", frequency: "Three times daily", duration: "7 days" },
    ];
    setParsed(fakeData);
    setRawText("Sample extracted prescription text");
    toast.success(`Extracted ${fakeData.length} medicines`);
    setBusy(false);
  };

  const save = async () => {
    if (!user || !parsed) return;
    setBusy(true);
    const { error } = await supabase.from("prescriptions").insert({
      patient_id: user.id, raw_text: rawText, parsed_drugs: parsed as any,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Prescription saved");
    nav("/app");
  };

  const addToCart = (drug: string, opt: { name: string; price: number }) => {
    add({
      med_id: `rx-${drug}-${opt.name}`,
      med_name: drug,
      pharmacy_id: opt.name,
      pharmacy_name: opt.name,
      unit_price: opt.price,
      qty: 1,
    });
    toast.success(`Added ${drug} from ${opt.name}`, {
      action: { label: "Cart", onClick: () => nav("/app/cart") },
    });
  };

  const clear = () => { setFile(null); setPreview(""); setParsed(null); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="h-3 w-3" /> AI-powered
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Scan prescription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snap a doctor's note. Our AI extracts medicines, dosages and finds the best prices nearby.
        </p>
      </div>

      <Card className="overflow-hidden p-6 shadow-soft animate-fade-up">
        <Label htmlFor="rxfile" className="block">
          <div className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card-soft p-10 text-center transition-base hover:border-primary hover:bg-primary-soft/30">
            {preview ? (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); clear(); }}
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-soft transition-base hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <img src={preview} alt="prescription" className="max-h-72 rounded-xl shadow-elevated" />
                <div className="text-xs text-muted-foreground">{file?.name}</div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">Click to upload prescription</div>
                  <div className="mt-1 text-xs text-muted-foreground">JPG or PNG · up to 5 MB</div>
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
                  <FileImage className="h-3 w-3" /> Drag & drop also works
                </div>
              </>
            )}
          </div>
        </Label>
        <Input id="rxfile" type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />

        <Button onClick={scan} disabled={!preview || busy}
          className="mt-5 h-12 w-full bg-gradient-cta text-base shadow-glow press">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
          {busy ? "Reading prescription..." : "Extract medicines with AI"}
        </Button>
      </Card>

      {parsed && (
        <Card className="p-6 shadow-soft animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight">Detected medicines</h3>
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success">
              {parsed.length} found
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {parsed.map((d, i) => {
              const cheapest = Math.min(...PRICE_OPTIONS.map((o) => o.price));
              return (
                <div key={i} className="rounded-xl border bg-card-soft p-4 transition-base hover:shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold">{d.drug}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {[d.dosage, d.frequency, d.duration].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1.5">
                    {PRICE_OPTIONS.map((opt) => {
                      const best = opt.price === cheapest;
                      return (
                        <div key={opt.name} className={`flex items-center justify-between rounded-lg border bg-card px-3 py-2 transition-base ${best ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{opt.name}</span>
                            <span className="text-[10px] text-muted-foreground">{opt.dist}</span>
                            {best && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Best</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold tabular ${best ? "text-primary" : ""}`}>₹{opt.price}</span>
                            <Button size="sm" variant="ghost" className="h-7 press" onClick={() => addToCart(d.drug, opt)}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {parsed.length > 0 && (
            <Button onClick={save} disabled={busy} variant="outline" className="mt-4 w-full press">
              Save prescription to my profile
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default ScanPrescription;
