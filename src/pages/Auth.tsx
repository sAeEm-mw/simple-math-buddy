import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Heart, Loader2, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const pwSchema = z.string().min(6, "Min 6 characters").max(72);

const Auth = () => {
  const nav = useNavigate();
  const { user, role, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPw, setShowPw] = useState(false);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [chosenRole, setChosenRole] = useState<"patient" | "doctor" | "pharmacy">("patient");

  useEffect(() => {
    if (!loading && user && role) {
      const home =
        role === "doctor" ? "/doctor" : role === "pharmacy" ? "/pharmacy" : role === "admin" ? "/admin" : "/app";
      nav(home, { replace: true });
    }
  }, [user, role, loading, nav]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(email); pwSchema.parse(pw); }
    catch (err: any) { toast.error(err.issues?.[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(email); pwSchema.parse(pw); }
    catch (err: any) { toast.error(err.issues?.[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { emailRedirectTo: redirectUrl, data: { full_name: name, role: chosenRole } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
  };

  const quickDemo = async (presetEmail: string, presetPw: string) => {
    setEmail(presetEmail); setPw(presetPw);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: presetEmail, password: presetPw });
    setBusy(false);
    if (error) toast.error(`Demo account not found yet. Sign up with ${presetEmail}.`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur transition-base hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Home
      </Link>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Heart className="h-7 w-7 text-primary-foreground" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome to MedLocal</h1>
            <p className="mt-1 text-sm text-muted-foreground">Compare. Order. Save lives.</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/95 p-6 shadow-floating backdrop-blur-xl">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-5 space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email" className="text-xs font-medium">Email</Label>
                  <Input id="si-email" type="email" autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pw" className="text-xs font-medium">Password</Label>
                  <div className="relative">
                    <Input id="si-pw" type={showPw ? "text" : "password"} autoComplete="current-password"
                      value={pw} onChange={(e) => setPw(e.target.value)} required className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-base hover:text-foreground"
                      aria-label="Toggle password visibility">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-cta text-base shadow-glow press">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name" className="text-xs font-medium">Full name</Label>
                  <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email" className="text-xs font-medium">Email</Label>
                  <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pw" className="text-xs font-medium">Password</Label>
                  <Input id="su-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">I am a</Label>
                  <Select value={chosenRole} onValueChange={(v) => setChosenRole(v as any)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient — buy meds, request blood</SelectItem>
                      <SelectItem value="doctor">Doctor — manage appointments</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy — receive orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-cta text-base shadow-glow press">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 border-t pt-5">
            <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Try a demo account
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="press" onClick={() => quickDemo("patient@demo.com", "demo1234")}>Patient</Button>
              <Button variant="outline" size="sm" className="press" onClick={() => quickDemo("pharmacy@demo.com", "demo1234")}>Pharmacy</Button>
              <Button variant="outline" size="sm" className="press" onClick={() => quickDemo("doctor@demo.com", "demo1234")}>Doctor</Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Click a role to auto-fill, or sign up first with that email.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
