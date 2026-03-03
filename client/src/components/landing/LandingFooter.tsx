import { Leaf } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-foreground/[0.03] border-t border-border/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-foreground">Verde</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-lg">
            Data sources: U.S. EPA ECHO, World Air Quality Index (WAQI),
            Climate TRACE, CalEnviroScreen 4.0, OpenStreetMap. Verde is a
            community project and is not affiliated with any government agency.
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Verde
          </p>
        </div>
      </div>
    </footer>
  );
}
