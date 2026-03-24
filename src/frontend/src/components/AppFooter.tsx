import { Heart, Skull } from "lucide-react";
import { SiDiscord, SiX, SiYoutube } from "react-icons/si";

const FOOTER_LINKS = ["Home", "Terms", "Support", "Forum", "Careers", "Press"];
const SOCIAL = [
  { Icon: SiX, label: "X", href: "https://x.com" },
  { Icon: SiYoutube, label: "YouTube", href: "https://youtube.com" },
  { Icon: SiDiscord, label: "Discord", href: "https://discord.com" },
];

export default function AppFooter() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="font-condensed text-xs text-muted-foreground hover:text-primary tracking-widest transition-colors"
                >
                  {link.toUpperCase()}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center">
              <Skull className="w-5 h-5 text-primary" />
            </div>
            <span className="font-condensed text-xs text-muted-foreground tracking-widest">
              GHOST SQUADRON
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-condensed text-xs text-muted-foreground tracking-widest">
              NEWSLETTER SIGNUP
            </span>
            <div className="flex items-center">
              <input
                data-ocid="footer.newsletter.input"
                type="email"
                placeholder="ENTER EMAIL"
                className="bg-secondary border border-border text-foreground font-condensed text-xs px-4 py-2.5 tracking-wider placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                data-ocid="footer.newsletter.button"
                className="bg-primary hover:bg-orange-400 text-primary-foreground px-4 py-2.5 transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-1 text-xs text-muted-foreground font-condensed">
          <span>© {year}. BUILT WITH</span>
          <Heart className="w-3 h-3 text-primary fill-primary mx-0.5" />
          <span>USING</span>
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline ml-1 tracking-widest"
          >
            CAFFEINE.AI
          </a>
        </div>
      </div>
    </footer>
  );
}
