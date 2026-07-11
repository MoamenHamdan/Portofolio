import React, { useEffect, useRef, memo } from "react";

/* ─── Floating hex / binary particles ──────────────────────────────── */
const CHARS = "01アイウエオАБВГ∑∏∆√≈≠∞ ABCDEF0123456789";
const rand = (min, max) => Math.random() * (max - min) + min;

const HexParticles = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 30 }, () => ({
      x: rand(0, canvas.width),
      y: rand(-500, 0),
      speed: rand(0.3, 1.2),
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      opacity: rand(0.04, 0.14),
      size: rand(10, 16),
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d) => {
        ctx.font = `${d.size}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(34,197,94,${d.opacity})`;
        ctx.fillText(d.char, d.x, d.y);
        d.y += d.speed;
        if (d.y > canvas.height + 20) {
          d.y = -20;
          d.x = rand(0, canvas.width);
          d.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          d.opacity = rand(0.04, 0.14);
        }
      });
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-0"
      style={{ opacity: 1 }}
    />
  );
});

/* ─── Horizontal scan line ──────────────────────────────────────────── */
const ScanLine = memo(() => (
  <div
    className="pointer-events-none fixed left-0 right-0 z-10 h-[2px]"
    style={{
      background: "linear-gradient(90deg,transparent,rgba(34,197,94,0.18),rgba(34,197,94,0.45),rgba(34,197,94,0.18),transparent)",
      animation: "scanLine 8s linear infinite",
      top: 0,
    }}
  />
));

/* ─── Corner HUD brackets ───────────────────────────────────────────── */
const Corner = ({ pos }) => {
  const base = "pointer-events-none fixed z-10 w-10 h-10";
  const borders = {
    tl: "top-4 left-4 border-t-2 border-l-2",
    tr: "top-4 right-4 border-t-2 border-r-2",
    bl: "bottom-20 left-4 border-b-2 border-l-2",
    br: "bottom-20 right-4 border-b-2 border-r-2",
  };
  return (
    <div
      className={`${base} ${borders[pos]} border-green-500/40 rounded-none`}
      style={{ animation: "cornerPulse 3s ease-in-out infinite" }}
    />
  );
};

/* ─── Floating threat badges (purely decorative) ────────────────────── */
const BADGES = [
  { label: "FIREWALL: ACTIVE", color: "text-green-400 border-green-500/30 bg-green-500/5", delay: "0s" },
  { label: "ENCRYPTION: AES-256", color: "text-red-400 border-red-500/30 bg-red-500/5", delay: "1.4s" },
  { label: "THREAT LEVEL: LOW", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5", delay: "2.8s" },
  { label: "IDS: MONITORING", color: "text-red-400 border-red-500/30 bg-red-500/5", delay: "4.2s" },
];

const ThreatBadges = memo(() => (
  <div className="pointer-events-none fixed bottom-24 right-4 z-20 flex flex-col gap-2 items-end hidden lg:flex">
    {BADGES.map((b) => (
      <div
        key={b.label}
        className={`text-[10px] font-mono px-2 py-1 rounded border ${b.color} opacity-0`}
        style={{ animation: `badgeFade 6s ease-in-out infinite`, animationDelay: b.delay }}
      >
        ● {b.label}
      </div>
    ))}
  </div>
));

/* ─── Top status bar ────────────────────────────────────────────────── */
const StatusBar = memo(() => {
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-1 text-[9px] font-mono border-b border-green-500/10 bg-black/30 backdrop-blur-sm">
      <span className="text-green-500/50">SOC-PORTFOLIO v2.1 // SESSION ACTIVE</span>
      <span className="text-green-500/40">{ts}</span>
      <span className="text-green-500/50">NODE: MH-SECURE-01</span>
    </div>
  );
});

/* ─── Keyframes injected once ───────────────────────────────────────── */
const STYLE = `
@keyframes scanLine {
  0%   { top: 0%; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes cornerPulse {
  0%,100% { opacity: 0.3; }
  50%      { opacity: 0.8; }
}
@keyframes badgeFade {
  0%,100%  { opacity: 0; transform: translateX(8px); }
  10%,85%  { opacity: 1; transform: translateX(0); }
}
`;

/* ─── Main wrapper ──────────────────────────────────────────────────── */
const CyberPageWrapper = ({ children }) => (
  <>
    <style>{STYLE}</style>
    <HexParticles />
    <ScanLine />
    <StatusBar />
    {["tl","tr","bl","br"].map(p => <Corner key={p} pos={p} />)}
    <ThreatBadges />
    <div className="relative z-10">{children}</div>
  </>
);

export default CyberPageWrapper;
