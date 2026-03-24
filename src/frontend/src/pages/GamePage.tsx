import { Crosshair, Shield, Skull, Swords, Target, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Mission } from "../backend";
import ActiveMissions from "../components/ActiveMissions";
import AppFooter from "../components/AppFooter";
import GameCanvas, { type GameMode } from "../components/GameCanvas";
import GameplayFeatures from "../components/GameplayFeatures";
import HeroSection from "../components/HeroSection";
import MissionBriefingModal from "../components/MissionBriefingModal";
import NavBar from "../components/NavBar";
import SquadIntel from "../components/SquadIntel";
import TacticalMap from "../components/TacticalMap";
import {
  useGlobalLocations,
  useMissions,
  useProfile,
  useSquad,
} from "../hooks/useQueries";

const GAME_MODES: {
  id: GameMode;
  label: string;
  tagline: string;
  desc: string;
  cta: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
}[] = [
  {
    id: "survival",
    label: "SURVIVAL",
    tagline: "SURVIVE · ADAPT · PREVAIL",
    desc: "Endless waves of enemy soldiers. Each wave is bigger, faster, tougher. How long can you hold the line?",
    cta: "PLAY",
    icon: <Skull className="w-8 h-8" />,
    accent: "#D97A2E",
    bg: "rgba(217,122,46,0.08)",
  },
  {
    id: "mission",
    label: "MISSION",
    tagline: "5 OBJECTIVES · ESCALATING DANGER",
    desc: "Complete 5 increasingly difficult missions: eliminations, survival, extraction, boss kill, and base defense.",
    cta: "START",
    icon: <Target className="w-8 h-8" />,
    accent: "#6FBF4A",
    bg: "rgba(111,191,74,0.08)",
  },
  {
    id: "sandbox",
    label: "SANDBOX",
    tagline: "UNLIMITED POWER · NO RULES",
    desc: "Unlimited ammo, spawn enemies at will, restore health instantly. Your playground, your rules.",
    cta: "CREATE",
    icon: <Zap className="w-8 h-8" />,
    accent: "#6fbfff",
    bg: "rgba(111,191,255,0.08)",
  },
];

const EXTRA_MODES: {
  id: string;
  label: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  locked: boolean;
}[] = [
  {
    id: "coop",
    label: "CO-OP",
    tagline: "COMING SOON",
    desc: "Squad up with allies for 2-4 player cooperative missions. Cover each other, complete objectives together.",
    icon: <Shield className="w-6 h-6" />,
    accent: "#a084ff",
    locked: true,
  },
  {
    id: "domination",
    label: "DOMINATION",
    tagline: "COMING SOON",
    desc: "Capture and hold 3 strategic zones simultaneously under constant enemy pressure.",
    icon: <Crosshair className="w-6 h-6" />,
    accent: "#ff84a0",
    locked: true,
  },
  {
    id: "assault",
    label: "ASSAULT",
    tagline: "COMING SOON",
    desc: "Storm an enemy stronghold. Break through gates, clear rooms, eliminate the warlord.",
    icon: <Swords className="w-6 h-6" />,
    accent: "#ffcc44",
    locked: true,
  },
];

export default function GamePage() {
  const [activeSection, setActiveSection] = useState("HOME");
  const [selectedMission, setSelectedMission] = useState<{
    mission: Mission;
    index: number;
  } | null>(null);
  const [activeGame, setActiveGame] = useState<GameMode | null>(null);

  const { data: profile } = useProfile();
  const { data: missions, isLoading: missionsLoading } = useMissions();
  const { data: squad, isLoading: squadLoading } = useSquad();
  const { data: globalLocations } = useGlobalLocations();

  const handleLaunchMission = () => {
    document
      .getElementById("mode-select")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (activeGame) {
    return (
      <AnimatePresence>
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GameCanvas mode={activeGame} onExit={() => setActiveGame(null)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar
        profile={profile ?? null}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onPlayNow={handleLaunchMission}
      />

      <HeroSection onLaunchMission={handleLaunchMission} />

      {/* ── Mode Selection ─────────────────────────────────────── */}
      <section id="mode-select" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full pulse-dot" />
              <span className="font-condensed text-xs text-primary tracking-widest">
                SELECT DEPLOYMENT MODE
              </span>
            </div>
            <h2 className="font-condensed font-900 text-5xl text-foreground tracking-tight">
              EXPLORE THE BATTLEFIELD
            </h2>
            <p className="text-muted-foreground font-sans text-sm mt-3 max-w-lg mx-auto">
              Three distinct combat experiences. Each mode tests a different
              facet of your tactical ability.
            </p>
          </motion.div>

          {/* Primary 3 Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {GAME_MODES.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col bg-card border border-border hover:border-opacity-100 transition-all duration-300 overflow-hidden cursor-pointer"
                style={{ borderColor: `${m.accent}44`, background: m.bg }}
                onClick={() => setActiveGame(m.id)}
                data-ocid={`mode.${m.id}.card`}
              >
                <div className="absolute inset-0 scanline pointer-events-none" />
                <div className="h-1 w-full" style={{ background: m.accent }} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div style={{ color: m.accent }}>{m.icon}</div>
                    <span
                      className="font-condensed text-xs tracking-widest px-2 py-0.5 border"
                      style={{ color: m.accent, borderColor: `${m.accent}55` }}
                    >
                      {m.tagline}
                    </span>
                  </div>
                  <h3 className="font-condensed font-900 text-4xl text-foreground tracking-tight mb-2">
                    {m.label}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                    {m.desc}
                  </p>
                  <button
                    type="button"
                    data-ocid={`mode.${m.id}.button`}
                    className="w-full font-condensed font-700 text-sm tracking-widest py-3 transition-all duration-200 hover:brightness-110 text-white"
                    style={{ background: m.accent }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGame(m.id);
                    }}
                  >
                    {m.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXTRA_MODES.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative flex items-center gap-4 bg-card/50 border border-border px-5 py-4 opacity-60"
                data-ocid={`mode.${m.id}.card`}
              >
                <div style={{ color: m.accent }}>{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-condensed font-700 text-sm text-foreground tracking-wider">
                      {m.label}
                    </span>
                    <span className="font-condensed text-xs text-muted-foreground tracking-widest">
                      {m.tagline}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    {m.desc}
                  </p>
                </div>
                <div className="font-condensed text-xs text-muted-foreground border border-border px-2 py-1 whitespace-nowrap">
                  LOCKED
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-card border border-border px-5 py-3 mb-8"
          >
            <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Skull className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-condensed font-700 text-sm text-foreground tracking-wide">
                  {profile.username.toUpperCase()}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-condensed text-xs text-muted-foreground">
                    LEVEL{" "}
                    <span className="text-primary">
                      {profile.level.toString()}
                    </span>
                  </span>
                  <span className="font-condensed text-xs text-muted-foreground">
                    XP:{" "}
                    <span className="text-primary">
                      {profile.xp.toString()}
                    </span>
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (Number(profile.xp) % 1000) / 10)}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActiveMissions
            missions={missions}
            isLoading={missionsLoading}
            onMissionClick={(mission, index) =>
              setSelectedMission({ mission, index })
            }
          />
          <TacticalMap missions={missions} globalLocations={globalLocations} />
        </div>

        <SquadIntel squad={squad} isLoading={squadLoading} />
        <GameplayFeatures />
      </main>

      <AppFooter />

      <MissionBriefingModal
        mission={selectedMission?.mission ?? null}
        missionIndex={selectedMission?.index ?? 0}
        open={!!selectedMission}
        onClose={() => setSelectedMission(null)}
      />
    </div>
  );
}
