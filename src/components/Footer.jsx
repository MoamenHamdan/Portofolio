import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Shield, Terminal, Github, Linkedin } from "lucide-react";

const Footer = () => {
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowArrow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showArrow && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-8 right-8 z-50 group"
          >
            <div className="relative w-12 h-12">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#ef4444] blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Button face */}
              <div className="relative w-12 h-12 rounded-full bg-black border border-white/10 group-hover:border-[#b91c1c]/60 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <ArrowUp className="w-5 h-5 text-white group-hover:text-[#ef4444] transition-colors group-hover:-translate-y-0.5 transform duration-200" />
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-black/80 backdrop-blur-xl overflow-hidden">
        {/* Subtle cyber grid */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-[#b91c1c] to-transparent" />
        <div className="absolute top-0 right-0 w-20 h-px bg-gradient-to-l from-[#ef4444] to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#b91c1c] to-[#ef4444] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-gray-500">
                <span className="text-[#b91c1c]">0x</span>MOAMEN
              </span>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
              <Terminal className="w-3 h-3 text-green-500/50" />
              <span>
                © {new Date().getFullYear()}{" "}
                <span className="text-gray-400 font-medium">Moamen Hamdan</span>
                {" "}· All rights reserved.
              </span>
            </div>

            {/* Social quick links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/MoamenHamdan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/moamen-hamdan/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
