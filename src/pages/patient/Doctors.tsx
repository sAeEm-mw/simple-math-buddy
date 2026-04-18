import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Star, MapPin, Video, User, X, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const FALLBACK_DOCS = [
  { id: "d1", specialty: "Cardiologist", qualification: "MD, DM Cardiology", experience_years: 12, consultation_fee: 800, city: "Mumbai", rating: 4.8 },
  { id: "d2", specialty: "Dermatologist", qualification: "MBBS, MD Derma", experience_years: 8, consultation_fee: 600, city: "Mumbai", rating: 4.7 },
  { id: "d3", specialty: "Pediatrician", qualification: "MBBS, DCH", experience_years: 15, consultation_fee: 700, city: "Navi Mumbai", rating: 4.9 },
  { id: "d4", specialty: "General Physician", qualification: "MBBS, MD", experience_years: 6, consultation_fee: 500, city: "Kharghar", rating: 4.6 },
];

const Doctors = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [mode, setMode] = useState<"in_person" | "video">("in_person");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", address: "", time: "" });

  useEffect(() => {
    supabase.from("doctors").select("*").limit(20).then(({ data }) => {
      const list = data && data.length > 0 ? data : FALLBACK_DOCS;
      setDocs(list);
      setLoading(false);
    });
  }, []);

  const openBooking = (d: any, m: "in_person" | "video") => {
    setSelectedDoctor(d); setMode(m); setOpen(true);
  };

  const confirmBooking = async () => {
    if (!user) return;
    if (!form.name || !form.age || !form.address || !form.time) {
      toast.error("Please fill all details"); return;
    }
    setBusy(true);
    await new Promise((res) => setTimeout(res, 1200));
    toast.success(`Appointment booked with Dr. ${selectedDoctor.specialty}`);
    setOpen(false);
    setForm({ name: "", age: "", address: "", time: "" });
    setBusy(false);
    try {
      await supabase.from("appointments").insert({
        patient_id: user.id, doctor_id: selectedDoctor.id,
        scheduled_at: new Date().toISOString(), reason: `Mode: ${mode}`, status: "confirmed" as const,
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-10 w-48 shimmer rounded-lg" />
        <div className="grid gap-3 md:grid-cols-2">
          {[0,1,2,3].map((i) => <div key={i} className="surface h-44 shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find a doctor</h1>
        <p className="mt-1 text-sm text-muted-foreground">Verified specialists · in-person or video consultations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d, i) => (
          <Card key={d.id} className="overflow-hidden p-5 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <User className="h-7 w-7" />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-success">
                  <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Dr. {d.specialty}</span>
                  <Badge variant="outline" className="gap-1 border-warning/30 bg-warning-soft text-warning">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="tabular">{d.rating ?? 4.7}</span>
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {d.qualification} · {d.experience_years}+ yrs experience
                </div>
                {d.city && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {d.city}
                  </div>
                )}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consultation</div>
                    <div className="text-lg font-bold tabular text-primary">₹{d.consultation_fee}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 press" onClick={() => openBooking(d, "in_person")}>
                    <Stethoscope className="mr-1.5 h-3.5 w-3.5" /> In-person
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-cta press shadow-glow" onClick={() => openBooking(d, "video")}>
                    <Video className="mr-1.5 h-3.5 w-3.5" /> Video
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
          <Card className="w-full max-w-md overflow-hidden p-0 shadow-floating animate-scale-in sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl">
            <div className="flex items-start justify-between border-b bg-card-soft p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  {mode === "video" ? <Video className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-semibold leading-tight">Book appointment</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Dr. {selectedDoctor?.specialty} · {mode === "video" ? "Video call" : "In-person"}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="press text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Patient name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Age</Label>
                  <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="h-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Preferred time</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="h-10 pl-10" />
                </div>
              </div>

              <div className="rounded-xl border bg-card-soft p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booking fee</span>
                  <span className="font-bold tabular">₹150</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Refundable if doctor is unavailable.
                </div>
              </div>

              <Button onClick={confirmBooking} disabled={busy} className="h-11 w-full bg-gradient-cta shadow-glow press">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {busy ? "Confirming..." : "Confirm & Pay ₹150"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Doctors;
