import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crosshair, Skull } from "lucide-react";
import type { Profile } from "../backend";

interface NavBarProps {
  profile: Profile | null | undefined;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onPlayNow: () => void;
}

const NAV_LINKS = ["HOME", "GAME INFO", "MISSIONS", "INTEL", "SQUAD", "HQ"];

export default function NavBar({
  profile,
  activeSection,
  onSectionChange,
  onPlayNow,
}: NavBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rotate-45 rounded-sm" />
            <Skull className="w-5 h-5 text-primary relative z-10" />
          </div>
          <div className="leading-tight">
            <div className="font-condensed font-900 text-xs text-primary tracking-widest">
              TACTICAL OPS:
            </div>
            <div className="font-condensed font-800 text-sm text-foreground tracking-widest">
              GHOST SQUADRON
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link}
              data-ocid={`nav.${link.toLowerCase().replace(" ", "_")}.link`}
              onClick={() => onSectionChange(link)}
              className={`font-condensed font-600 text-xs tracking-widest px-3 py-2 transition-colors ${
                activeSection === link
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="nav.play_now.button"
            onClick={onPlayNow}
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-orange-400 text-primary-foreground font-condensed font-700 text-xs tracking-widest px-4 py-2 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            PLAY NOW
          </button>
          {profile && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-primary/40">
                <AvatarFallback className="bg-secondary text-foreground text-xs font-condensed">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block font-condensed text-xs text-muted-foreground tracking-wider">
                {profile.username.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
