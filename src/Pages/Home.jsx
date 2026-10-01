import { useState, useEffect, memo, useMemo, useRef } from "react";
import {
  Github, Linkedin, Mail, ExternalLink, Instagram, Twitter,
  Youtube, Globe, Shield, Lock, Terminal, Wifi, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

import AOS from "aos";
import "aos/dist/aos.css";
import Tilt from "react-parallax-tilt";
import { useSiteSettings } from "../hooks/useSiteSettings";
import ContentState from "../components/ContentState";
import ContentImage from "../components/ContentImage";
import { normalizeHomeContent, normalizeSocialLinks } from "../utils/siteContent";

// ── Icon map for social platforms ────────────────────────────────────
const PLATFORM_ICONS = {
  github:     Github,
  linkedin:   Linkedin,
  instagram:  Instagram,
  twitter:    Twitter,
  youtube:    Youtube,
  tiktok:     Globe,
  medium:     Globe,
  devto:      Globe,
  tryhackme:  Shield,
  hackthebox: Terminal,
  telegram:   Globe,
  discord:    Globe,
  custom:     Globe,
};

const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const TechStack = memo(({ tech }) => (
  <div className="px-4 py-2 hidden sm:block rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs font-medium text-gray-200 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/20">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
      {tech}
    </div>
  </div>
));

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <Magnetic>
    <a href={href} className="block group relative w-[160px]">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ef4444] to-[#991b1b] rounded-xl opacity-20 blur-md group-hover:opacity-60 transition-all duration-700" />
        <div className="relative h-11 bg-black backdrop-blur-xl rounded-lg border border-white/10 leading-none overflow-hidden">
          <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#ef4444]/10 to-[#991b1b]/10" />
          <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
            <span className="text-gray-200 font-medium z-10 transition-colors group-hover:text-white">{text}</span>
            <Icon className={`w-4 h-4 text-gray-400 ${text === "Contact" ? "group-hover:translate-x-1" : "group-hover:rotate-45"} transform transition-all duration-300 z-10 group-hover:text-white`} />
          </span>
        </div>
    </a>
  </Magnetic>
));

// Dynamic social link button — icon resolved from platform key
const SocialLink = memo(({ icon: Icon, link, color, label }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} className="group relative p-3">
      <div className="absolute inset-0 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300" style={{ background: color || "linear-gradient(135deg,#ef4444,#991b1b)" }} />
      <div className="relative rounded-xl bg-black/50 backdrop-blur-xl p-2 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" style={{ color: color || undefined }} />
      </div>
  </a>
));

// Cybersecurity floating decorations
const FloatingCyberIcon = ({ icon: Icon, delay, x, y, size = 20 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0.05, 0.12, 0.05], scale: 1, x: [0, 15, 0], y: [0, -15, 0] }}
    transition={{ duration: 10, repeat: Infinity, delay, ease: "linear" }}
    className="absolute pointer-events-none text-white/10 hidden md:block"
    style={{ left: x, top: y }}
  >
    <Icon size={size} />
  </motion.div>
);

// ── Constants ─────────────────────────────────────────────────────────
const TYPING_SPEED   = 100;
const ERASING_SPEED  = 50;
const PAUSE_DURATION = 2000;

// ── Main Component ────────────────────────────────────────────────────
const Home = () => {
  const [text, setText]         = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isLoaded, setIsLoaded]   = useState(false);
  const settings = useSiteSettings("homeContent");
  const socials = useSiteSettings("socialLinks");
  const { typingWords: words, techStack, heroImageUrl: heroImg, heroTitlePart1,
    heroTitlePart2, heroDescription, displayName } = useMemo(
      () => normalizeHomeContent(settings.data), [settings.data]);
  const socialLinks = normalizeSocialLinks(socials.data);

  useEffect(() => { AOS.init({ once: true, offset: 10 }); }, []);
  useEffect(() => { setIsLoaded(true); return () => setIsLoaded(false); }, []);

  useEffect(() => {
    setWordIndex(0); setCharIndex(0); setText(""); setIsTyping(true);
  }, [words]);

  useEffect(() => {
    if (!words.length) return;
    const word = words[wordIndex % words.length];
    const pause = isTyping && charIndex >= word.length;
    const timeout = setTimeout(() => {
      if (pause) setIsTyping(false);
      else if (isTyping) { setText(word.slice(0, charIndex + 1)); setCharIndex(i => i + 1); }
      else if (charIndex > 0) { setText(word.slice(0, charIndex - 1)); setCharIndex(i => i - 1); }
      else { setWordIndex(i => (i + 1) % words.length); setIsTyping(true); }
    }, pause ? PAUSE_DURATION : isTyping ? TYPING_SPEED : ERASING_SPEED);
    return () => clearTimeout(timeout);
  }, [words, wordIndex, charIndex, isTyping]);

  if (settings.loading || settings.error) return <section id="Home" className="pt-24 min-h-[70vh]"><ContentState loading={settings.loading} error={settings.error} onRetry={settings.retry} /></section>;

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden pt-32 md:pt-20 bg-black"
      id="Home"
    >
      {/* Cybersecurity floating decorations */}
      <FloatingCyberIcon icon={Shield}       x="8%"  y="18%" delay={0} size={40} />
      <FloatingCyberIcon icon={Lock}         x="85%" y="12%" delay={2} size={30} />
      <FloatingCyberIcon icon={Terminal}     x="72%" y="68%" delay={4} size={35} />
      <FloatingCyberIcon icon={Wifi}         x="18%" y="78%" delay={3} size={25} />
      <FloatingCyberIcon icon={AlertTriangle} x="50%" y="8%" delay={1} size={22} />
      <FloatingCyberIcon icon={Github}       x="92%" y="55%" delay={5} size={28} />

      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Glass Shards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1], y: [0, -40, 0], rotate: [0, 45, 0] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
            className="absolute bg-white/5 backdrop-blur-[2px] border border-white/10"
            style={{
              width: 50 + i * 15,
              height: 50 + i * 15,
              left: `${i * 20}%`,
              top: `${i * 20}%`,
              borderRadius: "20% 70% 30% 80% / 30% 30% 70% 70%",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#ef4444]/5 via-transparent to-[#991b1b]/5 pointer-events-none" />

      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] sm:px-6 lg:px-[0%] min-h-[100dvh]">
          <div className="flex flex-col lg:flex-row items-center justify-center min-h-[100dvh] lg:min-h-[100dvh] md:justify-between gap-0 sm:gap-12 lg:gap-20 py-10 lg:py-0">

            {/* Left Column */}
            <div
              className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-left lg:text-left order-1 lg:order-1 lg:mt-0"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <div className="space-y-4 sm:space-y-6">

                {/* Title */}
                <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
                  <h1 className="break-words text-4xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight uppercase">
                    <span className="relative inline-block">
                      <span className="absolute -inset-2 bg-gradient-to-r from-red-500 to-red-900 blur-2xl opacity-40" />
                      <span 
                        className="relative bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent glitch-text font-mono tracking-wide"
                        data-text={heroTitlePart1}
                      >
                        {heroTitlePart1}
                      </span>
                    </span>
                    <br />
                    <span className="relative inline-block mt-2">
                      <span className="absolute -inset-2 bg-gradient-to-r from-[#ef4444] to-[#991b1b] blur-2xl opacity-40" />
                      <span 
                        className="relative bg-gradient-to-r from-[#ef4444] to-[#991b1b] bg-clip-text text-transparent transition-all duration-500 hover:brightness-125 glitch-text font-mono tracking-wide"
                        data-text={heroTitlePart2}
                      >
                        {heroTitlePart2}
                      </span>
                    </span>
                  </h1>
                </div>

                {/* Typing Effect */}
                <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
                  <span className="text-xl md:text-2xl text-red-300 font-mono tracking-wider font-bold">
                    &gt; {text}
                  </span>
                  <span className="w-[10px] h-6 bg-red-500 ml-1 animate-pulse" />
                </div>

                {/* Description */}
                <p className="whitespace-pre-line text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light"
                  data-aos="fade-up" data-aos-delay="1000">
                  {heroDescription}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
                  {techStack.map((tech, index) => (
                    <TechStack key={index} tech={tech} />
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 w-full justify-start" data-aos="fade-up" data-aos-delay="1400">
                  <CTAButton href="#Portofolio" text="Projects" icon={ExternalLink} />
                  <CTAButton href="#Contact"    text="Contact"  icon={Mail} />
                </div>

                {/* Dynamic Social Links from Firestore */}
                <div className="hidden sm:flex flex-wrap gap-2 justify-start" data-aos="fade-up" data-aos-delay="1600">
                  {socialLinks.map((social) => {
                    const Icon = PLATFORM_ICONS[social.platform] || Globe;
                    return (
                      <SocialLink
                        key={social.id || social.platform}
                        icon={Icon}
                        link={social.url}
                        color={social.color}
                        label={social.label}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column – Tilt Image */}
            <div
              className="w-full py-[10%] sm:py-0 lg:w-1/2 h-auto lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2 mt-8 lg:mt-0"
              data-aos="fade-left"
              data-aos-delay="600"
            >
              <Tilt
                tiltMaxAngleX={20}
                tiltMaxAngleY={20}
                perspective={1000}
                scale={1.07}
                transitionSpeed={1000}
                gyroscope={false}
                className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] rounded-3xl flex items-center justify-center group"
                style={{ overflow: "visible" }}
              >
                <div className="relative w-full h-full -mt-10 sm:-mt-10">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#ef4444]/20 to-[#991b1b]/20 blur-3xl animate-pulse" />
                  <div className="absolute inset-0 -z-10 rounded-full border border-white/5 animate-spin-slow" />
                  <div className="absolute inset-0 -z-10 rounded-full border border-white/10 animate-reverse-spin" style={{ margin: "-20px" }} />
                  <div className="hidden md:block absolute -inset-3 rounded-3xl blur-2xl opacity-60 z-0 group-hover:opacity-90 transition-all duration-500 bg-gradient-to-br from-[#ef4444]/40 via-[#991b1b]/30 to-[#ef4444]/40" />
                  <ContentImage
                    src={heroImg}
                    alt={displayName || "Profile"}
                    className="relative w-full h-full object-cover rounded-3xl border-4 border-white/10 shadow-xl group-hover:shadow-[0_0_60px_10px_rgba(139,92,246,0.18)] transition-all duration-500 z-10 max-h-[500px] sm:max-h-[300px]"
                    loading="eager"
                  />
                </div>
              </Tilt>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-[30px] h-[50px] rounded-full border-2 border-white/20 flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-red-500"
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Scroll</span>
        </div>
      </motion.div>
    </div>
  );
};

export default memo(Home);
