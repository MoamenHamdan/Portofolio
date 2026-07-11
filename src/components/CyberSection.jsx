import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Terminal, AlertTriangle, Lock, Wifi, Activity,
  Bug, Globe, Zap, Eye, ExternalLink, CheckCircle, XCircle,
  Server, Database, Code, Target
} from "lucide-react";

// ── Animated Terminal Log ─────────────────────────────────────────────
const LOG_LINES = [
  { time: "02:31:44", level: "WARN",  color: "text-yellow-400", msg: "Port scan detected from 185.220.101.47" },
  { time: "02:31:45", level: "ALERT", color: "text-red-400",    msg: "SQLi attempt blocked: payload=\"' OR 1=1--\"" },
  { time: "02:31:46", level: "INFO",  color: "text-green-400",  msg: "WAF rule #4412 triggered — request dropped" },
  { time: "02:31:47", level: "ALERT", color: "text-red-400",    msg: "XSS vector detected in POST /api/comment" },
  { time: "02:31:48", level: "INFO",  color: "text-green-400",  msg: "Input sanitized — threat neutralized" },
  { time: "02:31:49", level: "WARN",  color: "text-yellow-400", msg: "Brute-force: 47 failed logins from 10.0.0.12" },
  { time: "02:31:50", level: "ALERT", color: "text-red-400",    msg: "DDoS spike: 84k req/s — rate limiter active" },
  { time: "02:31:51", level: "INFO",  color: "text-green-400",  msg: "Firewall rules updated — IP 185.220.101.47 banned" },
  { time: "02:31:52", level: "INFO",  color: "text-red-400",   msg: "TLS 1.3 handshake OK — session established" },
  { time: "02:31:53", level: "WARN",  color: "text-yellow-400", msg: "Suspicious user-agent: SQLMap/1.7.2" },
  { time: "02:31:54", level: "ALERT", color: "text-red-400",    msg: "IDOR attempt: user 42 accessing /admin/users/1" },
  { time: "02:31:55", level: "INFO",  color: "text-green-400",  msg: "Access denied — 403 returned" },
];

const LiveTerminal = () => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [idx, setIdx] = useState(0);
  const containerRef = useRef(null);   // scroll INSIDE the box only

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % LOG_LINES.length;
        setVisibleLines(prev => {
          const updated = [...prev, { ...LOG_LINES[i], id: Date.now() }];
          return updated.slice(-8);
        });
        return next;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Scroll only within the terminal div, never touch window.scrollY
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="relative bg-black/90 rounded-2xl border border-green-500/20 overflow-hidden font-mono text-xs">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/10 bg-black/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-green-400/70 ml-2 text-[10px] tracking-widest uppercase">SIEM — Live Threat Monitor</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400/50 text-[9px]">LIVE</span>
        </div>
      </div>

      {/* Log area — overflow hidden on purpose; scroll driven by scrollTop above */}
      <div ref={containerRef} className="p-4 space-y-1.5 h-52 overflow-y-auto scrollbar-none">
        <AnimatePresence>
          {visibleLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 text-[11px] leading-relaxed"
            >
              <span className="text-gray-600 flex-shrink-0">{line.time}</span>
              <span className={`font-bold flex-shrink-0 w-10 ${line.color}`}>{line.level}</span>
              <span className="text-gray-300">{line.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cursor blink */}
      <div className="px-4 pb-3 flex items-center gap-1">
        <span className="text-green-400 text-[11px]">root@soc:~$</span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-3 bg-green-400 inline-block ml-1"
        />
      </div>
    </div>
  );
};

// ── Firewall Status Widget ────────────────────────────────────────────
const FIREWALL_RULES = [
  { label: "SQL Injection",      status: "BLOCKED", count: 1247 },
  { label: "XSS Vectors",        status: "BLOCKED", count: 893  },
  { label: "Brute Force",        status: "BLOCKED", count: 4421 },
  { label: "DDoS Mitigation",    status: "ACTIVE",  count: 28   },
  { label: "IDOR Prevention",    status: "ACTIVE",  count: 156  },
  { label: "Path Traversal",     status: "BLOCKED", count: 312  },
];

const FirewallWidget = () => {
  const [counts, setCounts] = useState(FIREWALL_RULES.map(r => r.count));

  useEffect(() => {
    const t = setInterval(() => {
      setCounts(prev => prev.map(c => c + Math.floor(Math.random() * 3)));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-black/80 border border-red-500/20 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-red-400" />
        <span className="text-white font-semibold text-sm">Firewall Status</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-mono">PROTECTED</span>
        </div>
      </div>

      {FIREWALL_RULES.map((rule, i) => (
        <div key={rule.label} className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${rule.status === "BLOCKED" ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
          <span className="text-gray-400 text-xs flex-1">{rule.label}</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            rule.status === "BLOCKED"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-green-500/10 text-green-400 border border-green-500/20"
          }`}>{rule.status}</span>
          <span className="text-gray-500 text-[10px] font-mono w-12 text-right">{counts[i].toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── Alert Banner ──────────────────────────────────────────────────────
const ALERTS = [
  "🔴 CRITICAL: Ransomware signature detected in email attachment",
  "🟡 WARNING: Unusual admin login from new geolocation",
  "🔴 CRITICAL: Zero-day exploit attempt on /api/upload endpoint",
  "🟢 INFO: Security patch CVE-2024-1234 applied successfully",
  "🟡 WARNING: Weak cipher suite negotiated — TLS 1.0 request blocked",
];

const AlertTicker = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ALERTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-black/80 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
      <div className="overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-gray-300 font-mono block"
          >
            {ALERTS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] text-red-400/50 font-mono flex-shrink-0 uppercase tracking-wider">Alert Feed</span>
    </div>
  );
};

// ── Known Attack Cards ────────────────────────────────────────────────
const ATTACKS = [
  {
    icon: Database,
    name: "SQL Injection",
    severity: "CRITICAL",
    severityColor: "text-red-400 bg-red-500/10 border-red-500/20",
    glow: "group-hover:shadow-red-500/20",
    border: "group-hover:border-red-500/30",
    desc: "Malicious SQL queries injected into input fields to manipulate or dump the database.",
    payload: `' OR '1'='1' --`,
    defense: "Parameterized queries, ORM, input validation",
  },
  {
    icon: Code,
    name: "XSS Attack",
    severity: "HIGH",
    severityColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    glow: "group-hover:shadow-orange-500/20",
    border: "group-hover:border-orange-500/30",
    desc: "Malicious scripts injected into web pages viewed by other users to steal sessions.",
    payload: `<script>document.cookie</script>`,
    defense: "CSP headers, output encoding, DOMPurify",
  },
  {
    icon: Wifi,
    name: "DDoS Attack",
    severity: "CRITICAL",
    severityColor: "text-red-400 bg-red-500/10 border-red-500/20",
    glow: "group-hover:shadow-red-500/20",
    border: "group-hover:border-red-500/30",
    desc: "Overwhelming a server with massive traffic from a botnet to cause service outage.",
    payload: `84,000 req/s from 12,000 IPs`,
    defense: "Rate limiting, CDN, Cloudflare, WAF",
  },
  {
    icon: Eye,
    name: "Phishing",
    severity: "HIGH",
    severityColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    glow: "group-hover:shadow-yellow-500/20",
    border: "group-hover:border-yellow-500/30",
    desc: "Deceptive emails or sites designed to steal credentials, tokens, or sensitive data.",
    payload: `From: security@paypa1.com`,
    defense: "MFA, email filtering, security awareness",
  },
  {
    icon: Lock,
    name: "IDOR",
    severity: "HIGH",
    severityColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    glow: "group-hover:shadow-red-500/20",
    border: "group-hover:border-red-500/30",
    desc: "Accessing unauthorized objects by manipulating IDs in API requests.",
    payload: `GET /api/users/1337/data`,
    defense: "Object-level auth, UUID references, ACL",
  },
  {
    icon: Bug,
    name: "Zero-Day",
    severity: "CRITICAL",
    severityColor: "text-red-400 bg-red-500/10 border-red-500/20",
    glow: "group-hover:shadow-red-500/20",
    border: "group-hover:border-red-500/30",
    desc: "Exploiting unknown vulnerabilities before patches are available from the vendor.",
    payload: `CVE-2024-????  CVSS: 9.8`,
    defense: "Virtual patching, EDR, threat intelligence",
  },
];

const AttackCard = ({ attack }) => {
  const [flipped, setFlipped] = useState(false);
  const Icon = attack.icon;

  return (
    <div
      className={`group relative cursor-pointer`}
      onClick={() => setFlipped(f => !f)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-56"
      >
        {/* Front */}
        <div className={`absolute inset-0 rounded-2xl bg-black/80 border border-white/5 ${attack.border} p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${attack.glow}`}
          style={{ backfaceVisibility: "hidden" }}>
          {/* Cyber corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500/30 rounded-br-2xl" />

          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${attack.severityColor}`}>
              {attack.severity}
            </span>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-1">{attack.name}</h3>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{attack.desc}</p>
          </div>

          <div className="bg-black/60 border border-white/5 rounded-lg px-3 py-2 font-mono text-[10px] text-green-400/70 truncate">
            {attack.payload}
          </div>

          <p className="text-[9px] text-gray-600 text-center">Click to flip for defense →</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-2xl bg-black/90 border border-green-500/20 p-5 flex flex-col gap-3 justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold text-sm">How to Defend</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">{attack.desc}</p>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2">
            <p className="text-green-400 text-xs font-mono">{attack.defense}</p>
          </div>
          <p className="text-[9px] text-gray-600 text-center">← Click to flip back</p>
        </div>
      </motion.div>
    </div>
  );
};

// ── TryHackMe Profile Widget ──────────────────────────────────────────
const TryHackMeWidget = () => {
  const THM_USER = "0xZeroTrace";
  const profileUrl = `https://tryhackme.com/p/${THM_USER}`;
  const badgeUrl = `https://tryhackme-badges.s3.amazonaws.com/${THM_USER}.png`;

  return (
    <div className="relative bg-black/80 border border-[#c11111]/30 rounded-2xl p-6 overflow-hidden">
      {/* Cyber corners */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#c11111]/40 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#c11111]/40 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#c11111]/40 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#c11111]/40 rounded-br-2xl" />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#c11111]/20 flex items-center justify-center border border-[#c11111]/30">
          <Target className="w-5 h-5 text-[#c11111]" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">TryHackMe Profile</h3>
          <p className="text-gray-500 text-xs font-mono">@{THM_USER}</p>
        </div>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c11111]/10 border border-[#c11111]/20 text-[#c11111] text-xs hover:bg-[#c11111]/20 transition-all">
          View Profile <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Official badge image */}
      <div className="flex justify-center mb-5">
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={badgeUrl}
            alt={`TryHackMe badge for ${THM_USER}`}
            className="rounded-xl border border-white/5 hover:border-[#c11111]/40 transition-all duration-300 hover:scale-105 max-w-full"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </a>
      </div>

      {/* NOTE about API */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
        <p className="text-yellow-400/70 text-[10px] font-mono leading-relaxed">
          {'> TryHackMe does not expose a public API for live stats.'}<br/>
          {'> Badge auto-updates on their servers as you complete rooms.'}<br/>
          {'> Click "View Profile" for full stats & achievements.'}
        </p>
      </div>
    </div>
  );
};

// ── Threat Stats Bar ──────────────────────────────────────────────────
const THREAT_STATS = [
  { label: "Threats Blocked Today", value: 8724,  color: "bg-red-500",    icon: XCircle },
  { label: "Active Firewall Rules", value: 2048,  color: "bg-red-500", icon: Shield },
  { label: "Packets Inspected/s",   value: 94120, color: "bg-red-500",   icon: Activity },
  { label: "Uptime",                value: "99.9%", color: "bg-green-500", icon: Server },
];

const ThreatStats = () => {
  const [counts, setCounts] = useState(THREAT_STATS.map(s => s.value));

  useEffect(() => {
    const t = setInterval(() => {
      setCounts(prev => prev.map((c, i) => {
        if (typeof c === "string") return c;
        return c + Math.floor(Math.random() * 5);
      }));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {THREAT_STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="relative bg-black/80 border border-white/5 rounded-xl p-4 overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 left-0 w-full h-0.5 ${stat.color} opacity-60`} />
            <Icon className={`w-5 h-5 mb-2 ${stat.color.replace("bg-", "text-")}`} />
            <p className="text-white font-bold text-lg font-mono">
              {typeof counts[i] === "string" ? counts[i] : counts[i].toLocaleString()}
            </p>
            <p className="text-gray-500 text-[10px] mt-0.5 leading-tight">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────────
const CyberSection = () => (
  <section className="py-16 md:py-24 px-[5%] md:px-[10%] text-white" id="Cyber">
    {/* Section header */}
    <div className="text-center mb-14" data-aos="fade-up">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        THREAT INTELLIGENCE DASHBOARD
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-400 to-[#b91c1c]">
        Cyber Defense Center
      </h2>
      <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm md:text-base">
        Real-world attacks I study, detect, and defend against — visualized live.
      </p>
    </div>

    {/* Alert ticker */}
    <div className="mb-8" data-aos="fade-up">
      <AlertTicker />
    </div>

    {/* Stats row */}
    <div className="mb-8" data-aos="fade-up">
      <ThreatStats />
    </div>

    {/* Terminal + Firewall */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12" data-aos="fade-up">
      <LiveTerminal />
      <FirewallWidget />
    </div>

    {/* Attack illustration */}
    <div className="mb-12" data-aos="zoom-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-500/30" />
        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest px-3">Known Attack Vectors</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mb-8">
        <img
          src="/cyber-attacks.png"
          alt="Famous Cyber Attacks: SQL Injection, XSS, DDoS, Phishing"
          className="rounded-2xl border border-white/5 w-full object-cover"
        />
        <div className="flex flex-col justify-center p-6 md:p-8 space-y-4">
          <h3 className="text-white font-bold text-2xl">Famous Attack Patterns</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            As a cybersecurity researcher and SOC analyst candidate, I study the anatomy
            of real-world attacks — from SQL injection to zero-days. Flip the cards below
            to explore each attack type and its defenses.
          </p>
          <div className="flex flex-wrap gap-2">
            {["OWASP Top 10", "MITRE ATT&CK", "CVE Research", "Threat Hunting"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs border border-red-500/20 text-red-400 bg-red-500/5 font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Flip cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ATTACKS.map(attack => (
          <AttackCard key={attack.name} attack={attack} />
        ))}
      </div>
    </div>

    {/* TryHackMe widget */}
    <div data-aos="fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c11111]/30" />
        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest px-3">Platform Activity</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c11111]/30" />
      </div>
      <div className="max-w-xl mx-auto">
        <TryHackMeWidget />
      </div>
    </div>
  </section>
);

export default CyberSection;
