/**
 * The one Play link. Always exactly href="/play/" (absolute, trailing slash):
 * the game is a separate static bundle beside this site, not a Next route,
 * so it is a plain anchor rather than next/link.
 */
export function PlayButton({ size = "large", className = "" }: { size?: "large" | "small"; className?: string }) {
  const sizing = size === "large" ? "px-12 py-4 text-4xl" : "px-6 py-2 text-2xl";
  return (
    <a href="/play/" className={`btn-game ${sizing} ${className}`}>
      <svg viewBox="0 0 24 24" width={size === "large" ? 34 : 24} height={size === "large" ? 34 : 24} aria-hidden="true">
        <path d="M7 4.5v15l12.5-7.5z" fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      Play
    </a>
  );
}
