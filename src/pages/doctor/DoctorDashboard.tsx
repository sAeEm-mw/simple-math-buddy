import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, X, Video, User, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-primary-soft text-primary",
  completed: "bg-success-soft text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (did: string) => {
    const { data } = await supabase
      .from("appointments")
      .select("*, profiles:patient_id(full_name)")
      .eq("doctor_id", did)
      .order("scheduled_at", { ascending: true });
    setAppts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: d } = await supabase.from("doctors").select("id").eq("user_id", user.id).maybeSingle();
      if (!d) {
        const { data: created } = await supabase.from("doctors")
          .insert({ user_id: user.id, specialty: "General Medicine", qualification: "MBBS",
            experience_years: 5, consultation_fee: 500, city: "Bangalore", lat: 12.97, lng: 77.59 })
          .select("id").single();
        if (created) { setDoctorId(created.id); await load(created.id); }
        else setLoading(false);
      } else {
        setDoctorId(d.id); await load(d.id);
      }
    })();
  }, [user?.id]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success(`Marked ${status}`);
    if (doctorId) load(doctorId);
  };

  const pending = appts.filter((a) => a.status === "pending").length;
  const today = appts.filter((a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()).length;
  const completed = appts.filter((a) => a.status === "completed").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Appointments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your consultations and patient bookings.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", value: pending, accent: "text-warning bg-warning-soft" },
          { label: "Today", value: today, accent: "text-primary bg-primary-soft" },
          { label: "Completed", value: completed, accent: "text-success bg-success-soft" },
        ].map((s) => (
          <Card key={s.label} className="p-5 shadow-soft">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.accent}`}>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-bold tabular tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map((i) => <div key={i} className="surface h-32 shimmer" />)}</div>
      ) : appts.length === 0 ? (
        <Card className="p-14 text-center bg-gradient-card">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-lg font-semibold">No appointments yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">When patients book you, they'll appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {appts.map((a, i) => (
            <Card key={a.id} className="p-5 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    {a.mode === "video" ? <Video className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-semibold">{a.profiles?.full_name ?? "Patient"}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {format(new Date(a.scheduled_at), "PPp")} · <span className="capitalize">{a.mode.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
                <Badge className={cn("capitalize", STATUS_STYLE[a.status] ?? "bg-muted")}>{a.status}</Badge>
              </div>

              {a.status === "pending" && (
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Button size="sm" className="flex-1 bg-gradient-cta press shadow-glow" onClick={() => setStatus(a.id, "confirmed")}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="press" onClick={() => setStatus(a.id, "cancelled")}>
                    <X className="mr-1.5 h-4 w-4" /> Cancel
                  </Button>
                </div>
              )}
              {a.status === "confirmed" && (
                <div className="mt-4 border-t pt-4">
                  <Button size="sm" className="press bg-gradient-primary" onClick={() => setStatus(a.id, "completed")}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark completed
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
