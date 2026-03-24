import { Crosshair, Globe, Users } from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Crosshair,
    title: "Real-Time Tactics",
    description:
      "Deploy squads, call airstrikes, and adapt to dynamic battlefield conditions. Every decision shapes the outcome.",
    detail:
      "Dynamic mission parameters respond to your strategic choices in real time.",
  },
  {
    icon: Users,
    title: "Squad Management",
    description:
      "Build your elite fireteam from 12 specialist classes. Level up soldiers, unlock gear, and forge the perfect unit.",
    detail:
      "Each operator has unique abilities that synergize with your tactical approach.",
  },
  {
    icon: Globe,
    title: "Dynamic Environments",
    description:
      "Fight across 12 global theaters — urban warzones, desert outposts, arctic stations, and dense jungle terrain.",
    detail:
      "Terrain affects movement, cover, and tactical advantage calculations.",
  },
];

const FEATURE_COLORS = [
  "bg-gradient-to-br from-orange-500/20 to-orange-600/5",
  "bg-gradient-to-br from-allied/20 to-allied/5",
  "bg-gradient-to-br from-success/20 to-success/5",
];

export default function GameplayFeatures() {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary" />
        <h2 className="font-condensed font-800 text-2xl text-foreground tracking-widest">
          KEY GAMEPLAY FEATURES
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12 }}
              className="tactical-panel hud-glow overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div
                className={`${FEATURE_COLORS[i]} p-5 border-b border-border`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-condensed font-700 text-base text-foreground tracking-wide">
                    {feature.title.toUpperCase()}
                  </h3>
                </div>
                <div className="h-24 bg-background/60 border border-border/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Icon className="w-8 h-8 text-foreground" />
                    <span className="font-condensed text-xs text-foreground tracking-widest">
                      TACTICAL VIEW
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-3">
                  {feature.description}
                </p>
                <p className="font-sans text-xs text-foreground/50 leading-relaxed border-t border-border pt-3">
                  {feature.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
