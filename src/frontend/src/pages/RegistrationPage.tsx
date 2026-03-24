import { Input } from "@/components/ui/input";
import { AlertCircle, Crosshair, Loader2, Skull } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRegister } from "../hooks/useQueries";

const DEFAULT_SQUAD = [
  { name: "Sgt. David M.", role: "Assault" },
  { name: "Cpl. Maya K.", role: "Sniper" },
];

const DOTS = [1, 2, 3];

export default function RegistrationPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const register = useRegister();

  const handleEnlist = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("CALLSIGN REQUIRED");
      return;
    }
    if (trimmed.length < 3) {
      setError("MINIMUM 3 CHARACTERS");
      return;
    }
    setError("");
    try {
      await register.mutateAsync({
        username: trimmed,
        squadMembers: DEFAULT_SQUAD,
      });
    } catch {
      setError("ENLISTMENT FAILED. RETRY.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage:
          "url('/assets/generated/hero-battlefield.dim_1920x1080.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/85" />
      <div className="absolute inset-0 scanline" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="tactical-panel hud-glow p-8 relative corner-bracket">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center">
              <Skull className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-condensed font-900 text-3xl text-foreground tracking-widest">
                TACTICAL OPS
              </h1>
              <h2 className="font-condensed font-600 text-lg text-primary tracking-widest">
                GHOST SQUADRON
              </h2>
              <p className="font-sans text-xs text-muted-foreground mt-2 leading-relaxed">
                Enter your callsign to join the Global Tactical Command and
                receive your first mission briefing.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="callsign"
                className="block font-condensed text-xs text-muted-foreground tracking-widest mb-2"
              >
                OPERATIVE CALLSIGN
              </label>
              <Input
                id="callsign"
                data-ocid="registration.callsign.input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnlist()}
                placeholder="e.g. LT. SARAH J."
                className="bg-secondary border-border focus:border-primary font-condensed tracking-wider text-foreground placeholder:text-muted-foreground/40 h-12"
                maxLength={24}
              />
              {error && (
                <div
                  data-ocid="registration.callsign.error_state"
                  className="flex items-center gap-2 mt-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  <span className="font-condensed text-xs text-destructive tracking-wider">
                    {error}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-background/40 border border-border p-4">
              <div className="font-condensed text-xs text-muted-foreground tracking-widest mb-3">
                DEFAULT SQUAD ASSIGNMENT
              </div>
              <div className="space-y-2">
                {DEFAULT_SQUAD.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between"
                  >
                    <span className="font-condensed text-xs text-foreground">
                      {m.name.toUpperCase()}
                    </span>
                    <span className="font-condensed text-xs text-primary">
                      {m.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              data-ocid="registration.enlist.button"
              onClick={handleEnlist}
              disabled={register.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-condensed font-700 text-sm tracking-widest py-4 transition-all"
            >
              {register.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ENLISTING...
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  ENLIST NOW
                </>
              )}
            </button>
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            {DOTS.map((d) => (
              <div key={d} className="w-1 h-1 bg-primary/60" />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
