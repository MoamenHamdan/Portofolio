import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { db, collection, getDocs, doc, getDoc } from "../../firebase";
import { motion } from "framer-motion";
import {
  FolderGit2, ShieldCheck, MessageSquare, BookOpen, Home, Cpu,
  Share2, Mail, Shield, ArrowUpRight, Activity, Zap, Terminal,
  TrendingUp, Eye, Clock, CheckCircle2, AlertCircle, Users,
} from "lucide-react";

// ── Animated counter ──────────────────────────────────────────────────
const AnimCount = ({ to, duration = 1200 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = 0;
    const step = Math.ceil(to / (duration / 30));
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [to, duration]);
  return <span>{val}</span>;
};

// ── Stat tile ─────────────────────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, color, to, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 18 }}
    className="relative group"
  >
    {/* Cyber corner brackets */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green-500/30 rounded-tl-xl z-10" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green-500/30 rounded-tr-xl z-10" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green-500/30 rounded-bl-xl z-10" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green-500/30 rounded-br-xl z-10" />

    <NavLink to={to} className="block">
      <div className="bg-black/50 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:scale-[1.02]">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        {/* Scan line */}
        <motion.div
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/15 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        />

        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-white font-mono tracking-tight">
            <AnimCount to={value} />
          </p>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </NavLink>
  </motion.div>
);

// ── Quick-nav card ────────────────────────────────────────────────────
const QuickNav = ({ icon: Icon, label, to, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -15 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
  >
    <NavLink to={to} className="group flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b91c1c]/30 to-[#ef4444]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        <Icon className="w-5 h-5 text-red-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
    </NavLink>
  </motion.div>
);

// ── Live status bar ───────────────────────────────────────────────────
const StatusBar = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-black/60 border border-green-500/15 rounded-xl px-5 py-3 flex items-center gap-4 font-mono text-xs"
  >
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-green-400">SYSTEM ONLINE</span>
    </div>
    <div className="h-4 w-px bg-white/10" />
    <div className="flex items-center gap-1.5 text-gray-500">
      <Activity className="w-3 h-3" />
      <span>Firebase Spark — Free tier active</span>
    </div>
    <div className="ml-auto flex items-center gap-1.5 text-gray-600">
      <Clock className="w-3 h-3" />
      <span>{new Date().toLocaleTimeString()}</span>
    </div>
  </motion.div>
);

// ── MAIN Dashboard ────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0, certs: 0, messages: 0, blogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projSnap, certSnap, msgSnap, blogSnap] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "certificates")),
          getDocs(collection(db, "messages")),
          getDocs(collection(db, "blogPosts")),
        ]);
        setStats({
          projects: projSnap.size,
          certs: certSnap.size,
          messages: msgSnap.size,
          blogs: blogSnap.size,
        });
      } catch (err) {
        console.warn("Dashboard load error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tiles = [
    { icon: FolderGit2, label: "Projects", value: stats.projects, color: "from-[#b91c1c] to-[#ef4444]", to: "/admin/projects", delay: 0 },
    { icon: ShieldCheck, label: "Certificates", value: stats.certs, color: "from-emerald-600 to-red-600", to: "/admin/certificates", delay: 0.07 },
    { icon: MessageSquare, label: "Messages", value: stats.messages, color: "from-red-600 to-rose-600", to: "/admin/messages", delay: 0.14 },
    { icon: BookOpen, label: "Blog Posts", value: stats.blogs, color: "from-orange-600 to-amber-600", to: "/admin/blog-posts", delay: 0.21 },
  ];

  const quickNavs = [
    { icon: Home, label: "Home Content", to: "/admin/home-content", desc: "Hero, typing words, about text", delay: 0 },
    { icon: Cpu, label: "Skills", to: "/admin/skills", desc: "Tech stack & proficiency levels", delay: 0.05 },
    { icon: Shield, label: "SOC Credibility", to: "/admin/soc-credibility", desc: "CTF badges, certs, THM rank", delay: 0.1 },
    { icon: Share2, label: "Social Links", to: "/admin/social-links", desc: "GitHub, LinkedIn, Instagram…", delay: 0.15 },
    { icon: MessageSquare, label: "Testimonials", to: "/admin/testimonials", desc: "Client & peer reviews", delay: 0.2 },
    { icon: Mail, label: "Messages", to: "/admin/messages", desc: "Contact form inbox", delay: 0.25 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-6 rounded-full bg-gradient-to-b from-[#b91c1c] to-[#ef4444]" />
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-gray-400 text-sm ml-5">
          Welcome back. Here's your portfolio at a glance.
        </p>
      </motion.div>

      {/* Status bar */}
      <StatusBar />

      {/* Stat tiles */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-gray-300">Content Overview</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiles.map(t => <StatTile key={t.label} {...t} />)}
          </div>
        )}
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Quick Navigation</span>
          </div>
          <div className="space-y-2">
            {quickNavs.map(n => <QuickNav key={n.to} {...n} />)}
          </div>
        </div>

        {/* Status / info panel */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">System Info</span>
          </div>
          <div className="bg-black/60 border border-green-500/15 rounded-2xl p-5 font-mono text-xs space-y-3">
            {[
              { icon: CheckCircle2, color: "text-green-400", label: "Firebase Firestore", value: "Connected" },
              { icon: CheckCircle2, color: "text-green-400", label: "Firebase Auth", value: "Authenticated" },
              { icon: CheckCircle2, color: "text-green-400", label: "Plan", value: "Spark (Free)" },
              { icon: CheckCircle2, color: "text-green-400", label: "Image Storage", value: "Firestore base64" },
              { icon: AlertCircle, color: "text-yellow-400", label: "Cloud Functions", value: "Not used (Spark)" },
              { icon: CheckCircle2, color: "text-green-400", label: "Hosting", value: "Firebase Hosting" },
            ].map(({ icon: I, color, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <I className={`w-3 h-3 ${color}`} />
                  {label}
                </div>
                <span className="text-gray-300">{value}</span>
              </div>
            ))}

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-3 h-3" />
                <span>Last loaded: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tip box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/15"
          >
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-300/70 leading-relaxed">
                <strong className="text-red-300">Tip:</strong> Use the <em>Home Content</em> page to set the project count, certificate count, and years of experience that appear on the public portfolio — no more waiting for counts to load!
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
