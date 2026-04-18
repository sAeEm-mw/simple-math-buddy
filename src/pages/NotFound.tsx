import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Heart className="h-8 w-8 text-primary-foreground" fill="currentColor" />
        </div>
        <h1 className="mt-6 bg-gradient-primary bg-clip-text text-7xl font-bold text-transparent">404</h1>
        <p className="mt-2 text-xl font-semibold tracking-tight">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button className="gap-2 bg-gradient-cta press shadow-glow">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
