import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

/* ─── Inline keyframes ───────────────────────────────────────────── */
const CSS = `
@keyframes scanPulse {
  0%,100% { box-shadow: 0 0 8px rgba(239,68,68,0.4); border-color: rgba(239,68,68,0.6); }
  50%     { box-shadow: 0 0 22px rgba(239,68,68,0.9); border-color: rgba(239,68,68,1); }
}
@keyframes flickerIn {
  0%  { opacity: 0; }
  10% { opacity: 1; }
  12% { opacity: 0; }
  14% { opacity: 1; }
  100%{ opacity: 1; }
}
@keyframes scanBar {
  0%   { width: 0%; }
  100% { width: 100%; }
}
@keyframes matrixRain {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes terminalBlink {
  0%,49% { opacity: 1; }
  50%,100%{ opacity: 0; }
}
@keyframes glitchH {
  0%   { clip-path: inset(40% 0 60% 0); transform: translate(-4px,0); }
  20%  { clip-path: inset(10% 0 85% 0); transform: translate(4px,0); }
  40%  { clip-path: inset(70% 0 5% 0);  transform: translate(-2px,0); }
  60%  { clip-path: inset(25% 0 55% 0); transform: translate(3px,0); }
  80%  { clip-path: inset(80% 0 2% 0);  transform: translate(-3px,0); }
  100% { clip-path: inset(40% 0 60% 0); transform: translate(0); }
}
`;

/* ─── Matrix rain strip ─────────────────────────────────────────── */
const CHARS = "ABCDEF0123456789アイウエオ∑∆";
const MatrixStrip = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(1);
    const tick = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22c55e";
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20" />;
};

/* ─── Typewriter that resolves "HAMAN" → "HAMDAN" ──────────────── */
const ResolveTyper = ({ wrong, right, onDone }) => {
  const [phase, setPhase] = useState("typing");   // typing | error | fixing | done
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (phase === "typing") {
      if (idx < wrong.length) {
        const t = setTimeout(() => { setText(wrong.slice(0, idx + 1)); setIdx(i => i + 1); }, 100);
        return () => clearTimeout(t);
      } else {
        setTimeout(() => setPhase("error"), 500);
      }
    }
    if (phase === "error") {
      setTimeout(() => setPhase("fixing"), 900);
    }
    if (phase === "fixing") {
      setText(right);
      setTimeout(() => { setPhase("done"); onDone?.(); }, 600);
    }
  }, [phase, idx]);

  const color =
    phase === "error"  ? "text-red-400" :
    phase === "fixing" ? "text-yellow-400" :
    phase === "done"   ? "text-green-400" : "text-red-300";

  return (
    <span className={`font-mono font-bold tracking-widest ${color} transition-colors duration-300`}>
      {text}
      {phase !== "done" && <span style={{ animation: "terminalBlink 0.8s step-end infinite" }}>█</span>}
      {phase === "error" && (
        <span className="ml-2 text-red-500 text-xs align-middle animate-pulse">[ERR: SPELLING]</span>
      )}
      {phase === "done" && (
        <span className="ml-2 text-green-500 text-xs align-middle">✓ VERIFIED</span>
      )}
    </span>
  );
};

/* ─── Scan progress bar ─────────────────────────────────────────── */
const ScanBar = ({ label, duration, color = "#22c55e", delay = 0, onDone }) => {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let start = null;
    let raf;
    const delayTimer = setTimeout(() => {
      const animate = (ts) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min((elapsed / duration) * 100, 100);
        setPct(Math.floor(p));
        if (p < 100) {
          raf = requestAnimationFrame(animate);
        } else {
          setDone(true);
          onDone?.();
        }
      };
      raf = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(delayTimer); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span style={{ color: done ? "#22c55e" : color }}>{label}</span>
        <span style={{ color: done ? "#22c55e" : "#94a3b8" }}>
          {done ? "✓ COMPLETE" : `${pct}%`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #fff2)` }}
        />
      </div>
    </div>
  );
};

/* ─── Log line component ─────────────────────────────────────────── */
const LOG_LINES = [
  { t: 500,  c: "text-yellow-400", m: "[WARN]  Visitor identified — initiating threat assessment..." },
  { t: 1500, c: "text-red-400",    m: "[INFO]  IP geolocation lookup... complete" },
  { t: 2500, c: "text-green-400",  m: "[OK]    Firewall rules verified — no active threats" },
  { t: 3500, c: "text-yellow-400", m: "[WARN]  Unknown identity detected — cross-referencing database..." },
  { t: 4500, c: "text-red-400",    m: "[CRIT]  Name mismatch found in record — HAMAN ≠ HAMDAN" },
  { t: 5500, c: "text-yellow-400", m: "[PATCH] Applying correction to identity record..." },
  { t: 6500, c: "text-green-400",  m: "[OK]    Identity resolved: MOAMEN HAMDAN — SOC Analyst" },
  { t: 7500, c: "text-green-400",  m: "[INFO]  Clearance granted — loading portfolio..." },
];

/* ─── MAIN ──────────────────────────────────────────────────────── */
const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [phase, setPhase] = useState(0); // 0=scanning 1=identity 2=done
  const [nameFixed, setNameFixed] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: false });

    // show log lines at their timestamps
    LOG_LINES.forEach(({ t, c, m }) => {
      setTimeout(() => setVisibleLogs(prev => [...prev, { c, m }]), t);
    });

    // exit loading screen
    const exitTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => onLoadingComplete?.(), 700);
    }, 8500);

    return () => clearTimeout(exitTimer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#020409] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)", transition: { duration: 0.7 } }}
        >
          <style>{CSS}</style>
          <MatrixStrip />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(34,197,94,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.4) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Red scan line sweeping top to bottom */}
          <div
            className="absolute left-0 right-0 h-[3px] pointer-events-none z-20"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),rgba(239,68,68,0.9),rgba(239,68,68,0.6),transparent)",
              animation: "scanBar 3s linear infinite, matrixRain 3s linear infinite",
              animationName: "scanLine2",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl space-y-6">

              {/* Top badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-xs text-red-400 tracking-[0.3em] uppercase">
                  ◈ SECURITY SCAN INITIATED ◈
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </motion.div>

              {/* Main panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="border border-red-500/40 rounded-lg bg-black/80 backdrop-blur-sm overflow-hidden"
                style={{ animation: "scanPulse 2s ease-in-out infinite" }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-2 bg-red-500/10 border-b border-red-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono text-xs text-red-400 tracking-widest">THREAT SCANNER v4.7.2</span>
                  </div>
                  <span className="font-mono text-xs text-gray-500">PID: 31337</span>
                </div>

                <div className="p-5 space-y-5">
                  {/* Scan bars */}
                  <div className="space-y-3">
                    <ScanBar label="◦ IDENTITY SCAN"      duration={1500} color="#ef4444" delay={500}  />
                    <ScanBar label="◦ THREAT ASSESSMENT"  duration={2000} color="#f97316" delay={1000}  />
                    <ScanBar label="◦ CREDENTIAL CHECK"   duration={1500} color="#eab308" delay={2500} />
                    <ScanBar label="◦ DATABASE LOOKUP"    duration={2000} color="#22c55e" delay={3500} />
                    <ScanBar label="◦ CLEARANCE VERIFY"   duration={1000} color="#22c55e" delay={5500} onDone={() => setPhase(1)} />
                  </div>

                  {/* Identity resolution */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase >= 1 ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="border border-yellow-500/30 rounded-md bg-yellow-500/5 p-4 space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="font-mono text-xs text-yellow-400 tracking-wider">IDENTITY RECORD — CORRECTION REQUIRED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-gray-500">FIRST NAME :</span>
                        <span className="text-green-400 ml-2">MOAMEN</span>
                        <span className="ml-2 text-green-600 text-[10px]">✓ OK</span>
                      </div>
                      <div>
                        <span className="text-gray-500">FIELD     :</span>
                        <span className="text-red-400 ml-2">SOC ANALYST</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-gray-500">LAST NAME  :</span>
                      <ResolveTyper
                        wrong="HAMAN"
                        right="HAMDAN"
                        onDone={() => setNameFixed(true)}
                      />
                    </div>

                    {nameFixed && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 pt-1 border-t border-green-500/20"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="font-mono text-xs text-green-400">
                          ✓ IDENTITY CONFIRMED: <strong>MOAMEN HAMDAN</strong> — SOC LEVEL 1 ANALYST
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Live log terminal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="border border-green-500/20 rounded-lg bg-black/70 p-4 h-36 overflow-hidden font-mono text-[11px] space-y-1 relative"
              >
                <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] text-green-500/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE LOG
                </div>
                {visibleLogs.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${l.c} leading-relaxed`}
                  >
                    {l.m}
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom status */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-600">
                <span>SESSION // MH-PORTFOLIO-2025</span>
                <span className="text-green-600 animate-pulse">▶ LOADING PORTFOLIO...</span>
                <span>ENC: TLS 1.3</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
