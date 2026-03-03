import { useState, useEffect } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold font-display tracking-tight ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              Verde
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#canopy"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                scrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              The Canopy
            </a>
            <a
              href="#how-it-works"
              className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                scrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              How It Works
            </a>
            <a href="/map">
              <Button
                variant="outline"
                className={`rounded-full px-5 ${
                  scrolled
                    ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    : "border-white/40 text-white hover:bg-white/10"
                }`}
              >
                Open Map
              </Button>
            </a>
            {isAuthenticated ? (
              <a href="/map">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
              </a>
            ) : (
              <a href="/api/login">
                <Button className="rounded-full bg-white text-emerald-700 hover:bg-white/90 shadow-lg px-5">
                  Sign In
                </Button>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className={scrolled ? "text-foreground" : "text-white"} />
            ) : (
              <Menu className={scrolled ? "text-foreground" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl p-4 mb-4 space-y-3">
            <a href="#canopy" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              The Canopy
            </a>
            <a href="#how-it-works" className="block py-2 text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              How It Works
            </a>
            <a href="/map" className="block">
              <Button className="w-full rounded-xl bg-emerald-600 text-white">
                Open Map
              </Button>
            </a>
            {!isAuthenticated && (
              <a href="/api/login" className="block">
                <Button variant="outline" className="w-full rounded-xl">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
