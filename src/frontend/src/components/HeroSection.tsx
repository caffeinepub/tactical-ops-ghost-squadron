import { Crosshair, Play } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onLaunchMission: () => void;
}

export default function HeroSection({ onLaunchMission }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage:
          "url('/assets/generated/hero-battlefield.dim_1920x1080.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-background/40" />
      <div className="absolute inset-0 scanline" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 bg-primary rounded-full pulse-dot" />
            <span className="font-condensed text-xs text-primary tracking-widest">
              CLASSIFIED OPERATION ACTIVE
            </span>
          </div>

          <h1 className="font-condensed font-900 text-6xl md:text-7xl lg:text-8xl text-foreground leading-none tracking-tight mb-2">
            LEAD. ENGAGE.
          </h1>
          <h1 className="font-condensed font-900 text-6xl md:text-7xl lg:text-8xl text-primary leading-none tracking-tight mb-6">
            DOMINATE.
          </h1>
          <h2 className="font-condensed font-600 text-2xl md:text-3xl text-foreground/80 tracking-widest mb-6">
            GLOBAL TACTICAL WARFARE
          </h2>

          <p className="font-sans text-sm text-muted-foreground max-w-lg mb-10 leading-relaxed">
            Command elite special forces across 12 active theaters of war.
            Coordinate your squad, execute precision strikes, and turn the tide
            of global conflict. Every mission counts.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-ocid="hero.launch_mission.button"
              onClick={onLaunchMission}
              className="flex items-center gap-2 bg-primary hover:bg-orange-400 text-primary-foreground font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200 hover:scale-105"
            >
              <Crosshair className="w-4 h-4" />
              LAUNCH MISSION
            </button>
            <button
              type="button"
              data-ocid="hero.view_gameplay.button"
              className="flex items-center gap-2 bg-transparent border border-foreground/40 hover:border-foreground text-foreground font-condensed font-700 text-sm tracking-widest px-8 py-4 transition-all duration-200"
            >
              <Play className="w-4 h-4" />
              VIEW GAMEPLAY
            </button>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-foreground/10 pt-8">
            {[
              { label: "ACTIVE OPERATIVES", value: "2,847" },
              { label: "MISSIONS COMPLETED", value: "14,293" },
              { label: "WIN RATE", value: "68.4%" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-condensed font-800 text-2xl text-primary">
                  {stat.value}
                </div>
                <div className="font-condensed text-xs text-muted-foreground tracking-widest mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
