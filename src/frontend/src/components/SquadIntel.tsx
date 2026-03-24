import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Swords, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { SquadMember } from "../backend";

interface SquadIntelProps {
  squad: SquadMember[] | undefined;
  isLoading: boolean;
}

const SOLDIER_IMAGES = [
  "/assets/generated/soldier-sarah.dim_200x200.jpg",
  "/assets/generated/soldier-david.dim_200x200.jpg",
];

const GEAR_ICONS = ["⚔", "🛡", "📡"];

export default function SquadIntel({ squad, isLoading }: SquadIntelProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-primary" />
        <h2 className="font-condensed font-800 text-2xl text-foreground tracking-widest">
          SQUAD INTEL
        </h2>
        <div className="flex-1 h-px bg-border" />
        <Users className="w-4 h-4 text-muted-foreground" />
      </div>

      {isLoading && (
        <div
          data-ocid="squad.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 bg-secondary/50" />
          ))}
        </div>
      )}

      {!isLoading && (!squad || squad.length === 0) && (
        <div
          data-ocid="squad.empty_state"
          className="tactical-panel p-8 text-center"
        >
          <p className="font-condensed text-sm text-muted-foreground tracking-widest">
            NO SQUAD MEMBERS ASSIGNED
          </p>
        </div>
      )}

      {!isLoading && squad && squad.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {squad.map((member, i) => {
            const atk = Number(member.profile.stats.attack);
            const def = Number(member.profile.stats.defense);
            const spd = Number(member.profile.stats.speed);
            const imgSrc = SOLDIER_IMAGES[i % SOLDIER_IMAGES.length];

            return (
              <motion.div
                key={member.profile.username}
                data-ocid={`squad.item.${i + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="tactical-panel hud-glow overflow-hidden"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={member.profile.username}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="font-condensed font-800 text-base text-foreground tracking-wide">
                      {member.profile.username.toUpperCase()}
                    </div>
                    <div className="font-condensed text-xs text-primary tracking-widest">
                      {member.role.toUpperCase()}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-primary px-2 py-0.5">
                      <span className="font-condensed font-700 text-xs text-primary-foreground">
                        LVL {member.profile.level.toString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Swords className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-condensed text-xs text-muted-foreground tracking-widest w-8">
                      ATK
                    </span>
                    <div className="flex-1">
                      <Progress value={atk} className="h-1.5 bg-secondary" />
                    </div>
                    <span className="font-condensed text-xs text-foreground w-8 text-right">
                      {atk}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-allied flex-shrink-0" />
                    <span className="font-condensed text-xs text-muted-foreground tracking-widest w-8">
                      DEF
                    </span>
                    <div className="flex-1">
                      <Progress value={def} className="h-1.5 bg-secondary" />
                    </div>
                    <span className="font-condensed text-xs text-foreground w-8 text-right">
                      {def}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span className="font-condensed text-xs text-muted-foreground tracking-widest w-8">
                      SPD
                    </span>
                    <div className="flex-1">
                      <Progress value={spd} className="h-1.5 bg-secondary" />
                    </div>
                    <span className="font-condensed text-xs text-foreground w-8 text-right">
                      {spd}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="font-condensed text-xs text-muted-foreground">
                      XP:{" "}
                      <span className="text-primary">
                        {member.profile.xp.toString()}
                      </span>
                    </span>
                    <div className="flex gap-1">
                      {GEAR_ICONS.map((gear) => (
                        <div
                          key={gear}
                          className="w-6 h-6 bg-secondary flex items-center justify-center text-xs border border-border"
                        >
                          {gear}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
