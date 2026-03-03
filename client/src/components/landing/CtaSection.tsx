import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export function CtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-emerald-50/30">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display mb-4">
            Ready to plant your first seed?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join the community of environmental observers and start making a difference today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/map">
              <Button
                size="lg"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 px-8 py-6 text-lg font-semibold gap-2"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            {!isAuthenticated && (
              <a href="/api/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold"
                >
                  Sign in with Google
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
