import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Droplet, Loader2, Send, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";
import {
  MapContainer, TileLayer, Marker, Popup, Circle
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodBank = () => {
  const { user } = useAuth();
  const lat = 19.047;
  const lng = 73.069;

  const [bloodType, setBloodType] = useState("O+");
  const [units, setUnits] = useState(2);
  const [hospital, setHospital] = useState("");
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    setRequests([
      { id: 1, blood_type: "O+", units_needed: 2, hospital: "Apollo Hospital, Kharghar" },
      { id: 2, blood_type: "B-", units_needed: 2, hospital: "Fortis Hospital, Vashi" },
      { id: 3, blood_type: "A+", units_needed: 1, hospital: "MGM Hospital, Kamothe" },
    ]);
  }, []);

  const broadcast = async () => {
    if (!user) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("SOS sent to nearby donors", { description: "We'll notify you as donors respond." });
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HERO header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-blood p-6 text-white shadow-glow-blood md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur pulse-blood">
            <Droplet className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              <AlertTriangle className="h-3 w-3" /> Emergency network
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Blood bank SOS</h1>
            <p className="mt-1 text-sm text-white/80 md:text-base">
              Broadcast urgent requests to verified donors within 1.5 km — reach in minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FORM */}
        <Card className="p-6 shadow-soft animate-fade-up">
          <h3 className="font-semibold tracking-tight">Request blood</h3>
          <p className="mt-1 text-xs text-muted-foreground">Specify the type and quantity needed.</p>

          <div className="mt-5 grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Blood type</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_TYPES.map((t) => (
                  <button
                    key={t} type="button" onClick={() => setBloodType(t)}
                    className={`rounded-lg border px-2 py-2 text-sm font-bold tabular transition-base press ${
                      bloodType === t
                        ? "border-blood bg-blood text-blood-foreground shadow-glow-blood"
                        : "bg-card text-foreground hover:border-blood/40 hover:bg-blood-soft"
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Units needed</Label>
                <Input type="number" min={1} max={20} value={units}
                  onChange={(e) => setUnits(Number(e.target.value))} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Hospital</Label>
                <Input value={hospital} onChange={(e) => setHospital(e.target.value)}
                  placeholder="Apollo Hospital" className="h-11" />
              </div>
            </div>

            <Button onClick={broadcast} disabled={busy}
              className="mt-1 h-12 bg-gradient-blood text-base shadow-glow-blood press">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {busy ? "Broadcasting..." : "Broadcast SOS"}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" /> Reaches ~140 verified donors within 1.5 km
            </div>
          </div>
        </Card>

        {/* MAP */}
        <Card className="overflow-hidden p-0 shadow-soft animate-fade-up">
          <div className="flex items-center justify-between border-b bg-card-soft px-5 py-3">
            <h3 className="font-semibold tracking-tight">Nearby donors</h3>
            <Badge variant="outline" className="gap-1 border-blood/30 bg-blood-soft text-blood">
              <span className="h-1.5 w-1.5 rounded-full bg-blood pulse-dot" /> 3 available
            </Badge>
          </div>
          <div className="h-[340px]">
            <MapContainer center={[lat, lng]} zoom={14} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle center={[lat, lng]} radius={1500} pathOptions={{ color: "hsl(358 78% 52%)", fillColor: "hsl(358 78% 52%)", fillOpacity: 0.08 }} />
              <Marker position={[lat, lng]}>
                <Popup><div><b>You are here</b><br />Kharghar</div></Popup>
              </Marker>
              <Marker position={[19.048, 73.070]}>
                <Popup>
                  <div className="space-y-1 text-sm">
                    <div><b>Ravi Gupta</b> · Age 21</div>
                    <div>Blood Group: <b>O+</b></div>
                    <div>Contact: 8446585687</div>
                  </div>
                </Popup>
              </Marker>
              {[{ lat: 19.045, lng: 73.068 }, { lat: 19.050, lng: 73.066 }].map((d, i) => (
                <Marker key={i} position={[d.lat, d.lng]}>
                  <Popup>Available Donor</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      </div>

      {/* REQUESTS */}
      <div>
        <h3 className="mb-3 font-semibold tracking-tight">Active blood requests</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {requests.map((r, i) => {
            const dist = (Math.random() * 2 + 0.3).toFixed(1);
            return (
              <Card key={i} className="p-4 shadow-soft animate-fade-up hover-lift" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blood text-blood-foreground shadow-glow-blood">
                    <span className="font-bold tabular">{r.blood_type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Distance</div>
                    <div className="text-sm font-semibold tabular">{dist} km</div>
                  </div>
                </div>
                <div className="mt-3 text-base font-semibold">{r.units_needed} unit{r.units_needed > 1 ? "s" : ""} needed</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.hospital}</div>
                <Button size="sm" variant="outline" className="mt-3 w-full press border-blood/40 text-blood hover:bg-blood-soft">
                  I can help
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BloodBank;
