import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart, Search, Droplet, ScanLine, MapPin, Stethoscope,
  ArrowRight, Shield, Sparkles, CheckCircle2, Star,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* NAV */}
      <header className="sticky top-0 z-40 glass">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Heart className="h-[18px] w-[18px] text-primary-foreground" fill="currentColor" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">MedLocal</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                Care, connected
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-cta shadow-glow press">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="container px-4 pt-14 pb-20 text-center md:pt-24 md:pb-28">
        <div className="mx-auto max-w-3xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-1.5 text-xs font-medium text-primary shadow-soft backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Healthcare marketplace · Live in India
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Save up to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">40%</span>{" "}
            on medicines.
            <br className="hidden sm:block" />
            <span className="block sm:inline"> Find blood donors in </span>
            <span className="bg-gradient-blood bg-clip-text text-transparent">minutes</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Compare real-time prices across nearby pharmacies, scan prescriptions with AI,
            and connect emergency blood requests with verified donors — all in one place.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <Button size="lg" className="h-12 gap-2 bg-gradient-cta px-7 text-base shadow-glow press hover-lift">
                Get started — it's free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base press">
                I'm a pharmacy / doctor
              </Button>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> RLS-secured data</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.8 average rating</span>
          </div>
        </div>

        {/* FEATURE GRID */}
        <div className="mx-auto mt-20 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search,     t: "Compare instantly",   d: "Fuzzy search across thousands of meds, sorted by price + distance.", color: "text-primary bg-primary-soft" },
            { icon: ScanLine,   t: "AI prescription OCR", d: "Snap a doctor's note. AI extracts drugs, dosages, frequency.",       color: "text-accent bg-accent-soft" },
            { icon: Droplet,    t: "Blood donor SOS",     d: "Broadcast emergency requests to matched donors within 5 km.",        color: "text-blood bg-blood-soft" },
            { icon: MapPin,     t: "Live pharmacy map",   d: "See real stock at pharmacies near you, in real time.",               color: "text-primary bg-primary-soft" },
            { icon: Stethoscope,t: "Doctor consults",     d: "Book in-person or video appointments with verified specialists.",     color: "text-accent bg-accent-soft" },
            { icon: Shield,     t: "Trusted & secure",    d: "Encrypted prescriptions, role-based access, RLS-protected data.",    color: "text-success bg-success-soft" },
          ].map((f, i) => (
            <div
              key={f.t}
              className="group relative overflow-hidden rounded-2xl border bg-gradient-card p-6 text-left shadow-soft transition-base hover-lift animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* STATS */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-4">
          {[
            { k: "40%", v: "Avg. savings" },
            { k: "1.2k+", v: "Pharmacies" },
            { k: "<5min", v: "Donor match" },
            { k: "24/7", v: "Support" },
          ].map((s) => (
            <div key={s.v} className="bg-card px-4 py-6 text-center">
              <div className="bg-gradient-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mx-auto mt-20 max-w-4xl overflow-hidden rounded-3xl bg-gradient-cta p-1 shadow-glow">
          <div className="rounded-[calc(1.5rem-2px)] bg-card px-6 py-12 text-center md:px-12 md:py-16">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Built for the way India shops for healthcare.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Join thousands saving on medicines and helping save lives — every day.</p>
            <Link to="/auth" className="mt-6 inline-block">
              <Button size="lg" className="h-12 gap-2 bg-gradient-cta px-7 text-base shadow-glow press">
                Create free account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/60 py-6 text-center text-xs text-muted-foreground backdrop-blur">
        © {new Date().getFullYear()} MedLocal — Care, connected.
      </footer>
    </div>
  );
};

export default Landing;
