import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

// Cybersecurity corner badge
const CyberBadge = () => (
  <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 border border-green-500/30 text-green-400 text-[10px] font-mono tracking-wider">
    <Shield className="w-2.5 h-2.5" />
    SECURED
  </div>
);

// Animated scan line
const ScanLine = () => (
  <motion.div
    initial={{ top: "0%" }}
    animate={{ top: ["0%", "100%", "0%"] }}
    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  />
);

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id, KeyFeatures }) => {
  const handleLiveDemo = (e) => {
    if (!ProjectLink) { e.preventDefault(); alert("Live demo link is not available"); }
  };
  const handleDetails = (e) => {
    if (!id) { e.preventDefault(); alert("Project details are not available"); }
  };

  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-xl bg-[#0a0a0a] backdrop-blur-lg border border-white/5 shadow-2xl transition-all duration-300 hover:shadow-red-500/10 hover:border-green-500/20">

        {/* Cyber corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500/40 rounded-tl-xl z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500/40 rounded-tr-xl z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500/40 rounded-bl-xl z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500/40 rounded-br-xl z-20" />

        {/* Scan line on hover */}
        <ScanLine />

        {/* Security badge */}
        <CyberBadge />

        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
        </div>

        <div className="relative p-5 z-10">
          <div className="relative overflow-hidden rounded-lg w-full" style={{ aspectRatio: '4 / 3', height: 180, background: '#18181b' }}>
            <img
              src={Img}
              alt={Title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Overlay on hover with hex pattern */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-green-400/60 font-mono text-[9px] leading-tight">
                {'> secure_connection_established\n> encryption: AES-256'}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-green-500/50 mt-1 flex-shrink-0" />
              <h3 className="text-xl font-semibold bg-gradient-to-r from-red-200 via-red-200 to-red-200 bg-clip-text text-transparent">
                {Title}
              </h3>
            </div>

            <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-2">
              {Description}
            </p>

            {KeyFeatures && KeyFeatures.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs text-red-300/90 space-y-1">
                {KeyFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}

            <div className="pt-4 flex items-center justify-between">
              {ProjectLink ? (
                <a href={ProjectLink} target="_blank" rel="noopener noreferrer" onClick={handleLiveDemo}
                  className="inline-flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200">
                  <span className="text-sm font-medium">Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">Demo Not Available</span>
              )}

              {id ? (
                <Link to={`/project/${id}`} onClick={handleDetails}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                  <span className="text-sm font-medium">Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">Details Not Available</span>
              )}
            </div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-green-500/20 rounded-xl transition-colors duration-300 -z-50" />
        </div>
      </div>
    </div>
  );
};

export default CardProject;
