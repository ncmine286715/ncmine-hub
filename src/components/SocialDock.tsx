import { DISCORD_URL, INSTAGRAM_URL } from "@/lib/links";
import { DiscordIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { trackEvent } from "@/lib/analytics";

/**
 * Tiny floating dock with Discord + Instagram.
 * Fixed bottom-left on mobile, top-right on desktop. Doesn't steal space.
 */
export function SocialDock() {
  return (
    <div className="pointer-events-none fixed left-2 bottom-20 z-40 flex flex-col gap-1.5 sm:left-auto sm:right-3 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        onClick={() => trackEvent("external_click", { to: "discord", source: "social_dock" })}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center border-2 border-foreground bg-[#5865F2] text-white shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 sm:h-10 sm:w-10"
      >
        <DiscordIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        onClick={() => trackEvent("external_click", { to: "instagram", source: "social_dock" })}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center border-2 border-foreground bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 sm:h-10 sm:w-10"
      >
        <InstagramIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </a>
    </div>
  );
}