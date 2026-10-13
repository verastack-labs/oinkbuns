import { PlayButton } from "@/components/play-button";

/**
 * The floating Play pill every devlog page carries (spec section 8), fixed
 * bottom-right and inside the safe area on phones with a home indicator.
 */
export function PlayPill() {
  return (
    <div className="fixed right-4 z-20" style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
      <PlayButton size="small" />
    </div>
  );
}
