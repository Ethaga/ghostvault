import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-black via-[hsl(220_16%_6%)] to-black text-foreground">
      <div className="text-center p-8 rounded-xl border bg-card/60 backdrop-blur glow max-w-md">
        <div className="mx-auto mb-4 h-12 w-12 rounded-md bg-[hsl(var(--primary)_/_0.15)] grid place-items-center glow">
          <ShieldOff className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold neon-text">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <div className="mt-6">
          <Button asChild className="glow">
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
