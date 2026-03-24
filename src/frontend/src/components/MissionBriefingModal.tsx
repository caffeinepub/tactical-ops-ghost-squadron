import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Mission, MissionOutcome } from "../backend";
import { useCompleteMission } from "../hooks/useQueries";

interface MissionBriefingModalProps {
  mission: Mission | null;
  missionIndex: number;
  open: boolean;
  onClose: () => void;
}

type ModalState = "briefing" | "deploying" | "success" | "fail";

export default function MissionBriefingModal({
  mission,
  missionIndex,
  open,
  onClose,
}: MissionBriefingModalProps) {
  const [modalState, setModalState] = useState<ModalState>("briefing");
  const completeMission = useCompleteMission();

  const handleDeploy = async () => {
    if (!mission) return;
    setModalState("deploying");
    const outcome =
      Math.random() < 0.7 ? MissionOutcome.success : MissionOutcome.fail;
    try {
      await completeMission.mutateAsync({
        missionId: BigInt(missionIndex),
        outcome,
      });
      setModalState(outcome === MissionOutcome.success ? "success" : "fail");
    } catch {
      setModalState("fail");
    }
  };

  const handleClose = () => {
    setModalState("briefing");
    onClose();
  };

  if (!mission) return null;

  const difficultyStars = Number(mission.difficulty);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="mission_briefing.dialog"
        className="bg-card border-border max-w-lg p-0 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {modalState === "briefing" && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="tactical-panel-header px-6 py-4">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full pulse-dot" />
                    <span className="font-condensed text-xs text-primary tracking-widest">
                      MISSION BRIEFING
                    </span>
                  </div>
                  <DialogTitle className="font-condensed font-800 text-xl text-foreground tracking-wide">
                    {mission.title.toUpperCase()}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="tactical-panel p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="font-condensed text-xs text-muted-foreground tracking-widest">
                        LOCATION
                      </span>
                    </div>
                    <span className="font-condensed font-600 text-sm text-foreground">
                      {mission.location}
                    </span>
                  </div>
                  <div className="tactical-panel p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span className="font-condensed text-xs text-muted-foreground tracking-widest">
                        XP REWARD
                      </span>
                    </div>
                    <span className="font-condensed font-700 text-sm text-primary">
                      {mission.xpReward.toString()} XP
                    </span>
                  </div>
                </div>

                <div>
                  <div className="font-condensed text-xs text-muted-foreground tracking-widest mb-2">
                    DIFFICULTY
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        // biome-ignore lint/suspicious/noArrayIndexKey: static length array
                        key={i}
                        className={`w-4 h-4 ${
                          i < difficultyStars
                            ? "text-primary fill-primary"
                            : "text-border"
                        }`}
                      />
                    ))}
                    <span className="font-condensed text-xs text-muted-foreground ml-2">
                      {difficultyStars <= 2
                        ? "STANDARD"
                        : difficultyStars <= 3
                          ? "ELEVATED"
                          : "CRITICAL"}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="font-condensed text-xs text-muted-foreground tracking-widest mb-2">
                    OBJECTIVES
                  </div>
                  <div className="tactical-panel p-4">
                    <p className="font-sans text-sm text-foreground/90 leading-relaxed">
                      {mission.objectives}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 p-3">
                  <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-muted-foreground">
                    Mission outcome is probabilistic. Success rate: 70%. Failure
                    may result in XP penalty.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    data-ocid="mission_briefing.deploy.button"
                    onClick={handleDeploy}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-orange-400 text-primary-foreground font-condensed font-700 text-sm tracking-widest py-3 transition-all"
                  >
                    <Crosshair className="w-4 h-4" />
                    DEPLOY
                  </button>
                  <button
                    type="button"
                    data-ocid="mission_briefing.cancel.button"
                    onClick={handleClose}
                    className="px-6 bg-secondary hover:bg-secondary/80 text-foreground font-condensed font-700 text-sm tracking-widest py-3 transition-all"
                  >
                    ABORT
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {modalState === "deploying" && (
            <motion.div
              key="deploying"
              data-ocid="mission_briefing.loading_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-16 flex flex-col items-center gap-6"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <div className="font-condensed font-700 text-lg text-foreground tracking-widest mb-2">
                  DEPLOYING SQUAD
                </div>
                <div className="font-sans text-sm text-muted-foreground">
                  Mission in progress...
                </div>
              </div>
            </motion.div>
          )}

          {modalState === "success" && (
            <motion.div
              key="success"
              data-ocid="mission_briefing.success_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-success/20 border-2 border-success flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <div className="text-center">
                <div className="font-condensed font-900 text-3xl text-success tracking-widest mb-2">
                  MISSION SUCCESS
                </div>
                <div className="font-sans text-sm text-muted-foreground mb-1">
                  {mission.title}
                </div>
                <div className="font-condensed text-xl text-primary">
                  +{mission.xpReward.toString()} XP EARNED
                </div>
              </div>
              <button
                type="button"
                data-ocid="mission_briefing.close.button"
                onClick={handleClose}
                className="bg-primary hover:bg-orange-400 text-primary-foreground font-condensed font-700 text-sm tracking-widest px-10 py-3 transition-all"
              >
                DEBRIEF
              </button>
            </motion.div>
          )}

          {modalState === "fail" && (
            <motion.div
              key="fail"
              data-ocid="mission_briefing.error_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-destructive/20 border-2 border-destructive flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div className="text-center">
                <div className="font-condensed font-900 text-3xl text-destructive tracking-widest mb-2">
                  MISSION FAILED
                </div>
                <div className="font-sans text-sm text-muted-foreground mb-1">
                  {mission.title}
                </div>
                <div className="font-condensed text-sm text-muted-foreground">
                  Squad extracted. Regroup and retry.
                </div>
              </div>
              <button
                type="button"
                data-ocid="mission_briefing.close.button"
                onClick={handleClose}
                className="bg-secondary hover:bg-secondary/80 text-foreground font-condensed font-700 text-sm tracking-widest px-10 py-3 transition-all"
              >
                EXTRACT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
