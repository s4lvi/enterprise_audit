/**
 * Fixed full-bleed logo watermark, low opacity, behind all content.
 * Carries the brand visual without competing with page content.
 */
export function BackgroundSash() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-red.svg"
        alt=""
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "2000px",
          transform: "rotate(20deg) scale(3)",
          transformOrigin: "0 0",
          opacity: 0.08,
        }}
      />
    </div>
  );
}
