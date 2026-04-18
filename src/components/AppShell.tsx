import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Heart, Search, ScanLine, Droplet, ShoppingBag,
  LayoutDashboard, Stethoscope, Pill, Shield,
  LogOut, Menu, X, ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navByRole: Record<string, { to: string; label: string; icon: any }[]> = {
  patient: [
    { to: "/app", label: "Search", icon: Search },
    { to: "/app/scan", label: "Scan Rx", icon: ScanLine },
    { to: "/app/cart", label: "Cart", icon: ShoppingCart },
    { to: "/app/orders", label: "Orders", icon: ShoppingBag },
    { to: "/app/blood", label: "Blood", icon: Droplet },
    { to: "/app/doctors", label: "Doctors", icon: Stethoscope },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctor/heatmap", label: "Patient Heatmap", icon: Heart },
  ],
  pharmacy: [
    { to: "/pharmacy", label: "Orders", icon: ShoppingBag },
    { to: "/pharmacy/inventory", label: "Inventory", icon: Pill },
    { to: "/pharmacy/analytics", label: "Top Searches", icon: LayoutDashboard },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: Shield },
  ],
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { role, signOut } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const items_nav = navByRole[role ?? "patient"] ?? [];
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  const handleSignOut = async () => {
    await signOut();
    nav("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass">
        <div className="container flex h-16 items-center justify-between gap-2 px-3 md:px-6">
          <Link to="/app" className="flex items-center gap-2.5 press">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Heart className="h-[18px] w-[18px] text-primary-foreground" fill="currentColor" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">MedLocal</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
                Care, connected
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {items_nav.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/app" || it.to === "/doctor" || it.to === "/pharmacy" || it.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-base",
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <it.icon className="h-4 w-4" />
                {it.label}
                {it.to === "/app/cart" && cartCount > 0 && (
                  <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {role && (
              <span className="hidden rounded-full border bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:inline">
                {role}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="press">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden press"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="border-t bg-card lg:hidden animate-slide-down">
            <nav className="container flex flex-col gap-1 px-3 py-3">
              {items_nav.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-base",
                      isActive ? "bg-primary-soft text-primary" : "text-foreground hover:bg-muted",
                    )
                  }
                >
                  <it.icon className="h-4 w-4" />
                  <span className="flex-1">{it.label}</span>
                  {it.to === "/app/cart" && cartCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main key={loc.pathname} className="container px-3 py-6 md:px-6 md:py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
};
