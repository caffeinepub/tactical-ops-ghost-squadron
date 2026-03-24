import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Lock,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import type { Mission } from "../backend";
import { MissionStatus } from "../backend";

interface ActiveMissionsProps {
  missions: Mission[] | undefined;
  isLoading: boolean;
  onMissionClick: (mission: Mission, index: number) => void;
}

const DIFFICULTY_LABELS = [
  "",
  "ROUTINE",
  "ELEVATED",
  "CRITICAL",
  "EXTREME",
  "CLASSIFIED",
];

export default function ActiveMissions({
  missions,
  isLoading,
  onMissionClick,
}: ActiveMissionsProps) {
  const available =
    missions?.filter((m) => m.status === MissionStatus.available) ?? [];
  const completed =
    missions?.filter((m) => m.status === MissionStatus.completed) ?? [];
  const locked =
    missions?.filter((m) => m.status === MissionStatus.locked) ?? [];

  return (
    <div className="tactical-panel hud-glow">
      <div className="tactical-panel-header px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-condensed font-700 text-sm text-foreground tracking-widest">
            ACTIVE MISSIONS
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-condensed text-muted-foreground">
          <span className="text-primary">{available.length} AVAILABLE</span>
          <span>{completed.length} DONE</span>
          <span>{locked.length} LOCKED</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading && (
          <div data-ocid="missions.loading_state" className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 bg-secondary/50" />
            ))}
          </div>
        )}

        {!isLoading && missions?.length === 0 && (
          <div data-ocid="missions.empty_state" className="py-8 text-center">
            <p className="font-condensed text-sm text-muted-foreground tracking-widest">
              NO MISSIONS AVAILABLE
            </p>
          </div>
        )}

        {!isLoading &&
          missions?.map((mission, i) => (
            <motion.div
              key={mission.title}
              data-ocid={`missions.item.${i + 1}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() =>
                mission.status === MissionStatus.available &&
                onMissionClick(mission, i)
              }
              className={`relative p-4 border transition-all ${
                mission.status === MissionStatus.available
                  ? "border-border hover:border-primary/60 cursor-pointer bg-secondary/30 hover:bg-secondary/50 group"
                  : mission.status === MissionStatus.completed
                    ? "border-success/30 bg-success/5 cursor-default"
                    : "border-border/50 bg-secondary/10 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center mt-0.5 ${
                      mission.status === MissionStatus.available
                        ? "bg-primary/20"
                        : mission.status === MissionStatus.completed
                          ? "bg-success/20"
                          : "bg-border/20"
                    }`}
                  >
                    {mission.status === MissionStatus.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : mission.status === MissionStatus.locked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Crosshair className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-condensed font-700 text-sm text-foreground tracking-wide truncate">
                      {mission.title}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground mt-0.5">
                      {mission.location}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className={`font-condensed text-xs tracking-widest ${
                          mission.status === MissionStatus.available
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {DIFFICULTY_LABELS[Number(mission.difficulty)] ||
                          "UNKNOWN"}
                      </span>
                      <span className="font-condensed text-xs text-muted-foreground">
                        +{mission.xpReward.toString()} XP
                      </span>
                    </div>
                  </div>
                </div>
                {mission.status === MissionStatus.available && (
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
