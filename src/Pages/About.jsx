import PropTypes from "prop-types";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { normalizeHomeContent } from "../utils/siteContent";
import ContentState from "../components/ContentState";
import ContentImage from "../components/ContentImage";
import { useEffect, memo, useMemo, useState } from "react";
import {
  FileText,
  Code,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  Lock,
  FolderGit2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { db, collection, getCountFromServer } from "../firebase";
import { motion } from "framer-motion";

// Memoized Components
const Header = memo(({ subtitle }) => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 uppercase font-mono tracking-wide glitch-text"
        data-text="About Me"
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
      data-aos-duration="800"
    >
      <Shield className="w-5 h-5 text-red-500" />
      {subtitle}
      <Shield className="w-5 h-5 text-red-500" />
    </p>
  </div>
));

const ProfileImage = memo(({ src, name }) => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div className="relative animate-float-updown group" style={{ display: 'inline-block' }}>
      {/* Glowing gradient backgrounds */}
      <div className="absolute -inset-6 opacity-40 z-0 hidden sm:block pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-900 to-black rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-l from-red-500 via-red-800 to-black rounded-full blur-2xl opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-900 to-transparent rounded-full blur-2xl" />
      </div>
      <div className="relative">
        <div className="w-60 h-60 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-gradient-to-r from-[#ef4444] to-[#991b1b] transition-all duration-500 shadow-[0_0_40px_rgba(120,119,198,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_80px_20px_rgba(139,92,246,0.35)]">
          <ContentImage
            src={src}
            alt={name || "Profile"}
            className="w-full h-full object-cover transition-all duration-700"
            loading="lazy"
          />
        </div>
      </div>
      <style>{`
        @keyframes float-updown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        .animate-float-updown {
          animation: float-updown 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  </div>
));

const Counter = ({ value }) => <span>{value ?? "—"}</span>;

const StatCard = memo(
  ({ icon: Icon, color, value, label, description, animation }) => (
    <div data-aos={animation} data-aos-duration={1300} className="relative group">
      {/* Cyber corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl z-20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/30 rounded-tr-2xl z-20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/30 rounded-bl-2xl z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/30 rounded-br-2xl z-20" />

      <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-red-500/20 hover:shadow-2xl h-full flex flex-col justify-between">
        <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

        {/* Scan line on hover */}
        <motion.div
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        />

        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 transition-transform group-hover:rotate-6">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white" data-aos="fade-up-left" data-aos-duration="1500" data-aos-anchor-placement="top-bottom">
            <Counter value={value} />
          </span>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wider text-gray-300 mb-2">{label}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{description}</p>
            <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  )
);

const AboutPage = () => {
  const settings = useSiteSettings("homeContent");
  const { aboutMeText, cvUrl, yearsOfExperience, aboutImageUrl, displayName, aboutSubtitle } = normalizeHomeContent(settings.data);
  const [totalProjects, setTotalProjects] = useState(null);
  const [totalCertificates, setTotalCertificates] = useState(null);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCountFromServer(collection(db, "projects")),
      getCountFromServer(collection(db, "certificates")),
    ]).then(([projects, certificates]) => {
      if (!active) return;
      if (projects.status === "fulfilled") setTotalProjects(projects.value.data().count);
      if (certificates.status === "fulfilled") setTotalCertificates(certificates.value.data().count);
    });
    return () => { active = false; };
  }, []);

  // Optimized AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: true,
      });
    };

    initAOS();

    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoized stats data — now uses Firestore values directly
  const statsData = useMemo(
    () => [
      {
        icon: FolderGit2,
        color: "from-[#ef4444] to-[#991b1b]",
        value: totalProjects,
        label: "Total Projects",
        description: "Innovative web solutions crafted",
        animation: "fade-right",
      },
      {
        icon: ShieldCheck,
        color: "from-[#991b1b] to-[#ef4444]",
        value: totalCertificates,
        label: "Certificates",
        description: "Professional skills validated",
        animation: "fade-up",
      },
      {
        icon: Clock,
        color: "from-[#ef4444] to-[#991b1b]",
        value: yearsOfExperience,
        label: "Years of Experience",
        description: "Continuous learning journey",
        animation: "fade-left",
      },
    ],
    [totalProjects, totalCertificates, yearsOfExperience]
  );

  if (settings.loading || settings.error) return <section id="About"><ContentState loading={settings.loading} error={settings.error} onRetry={settings.retry} /></section>;

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0"
      id="About"
    >
      <Header subtitle={aboutSubtitle} />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="min-w-0 w-full space-y-6 text-center lg:text-left">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase font-mono tracking-wide"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 glitch-text"
                data-text="Hello, I'm"
              >
                Hello, I'm
              </span>
              <span
                className="block mt-2 text-red-200 glitch-text tracking-wide"
                data-text={displayName}
                data-aos="fade-right"
                data-aos-duration="1300"
              >
                {displayName}
              </span>
            </h2>

            <p
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0"
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              {aboutMeText}
            </p>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              {cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open CV"
                  className="group relative w-full lg:w-auto px-8 py-3 rounded-xl border border-red-500/30 bg-black/60 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 overflow-hidden"
                  data-aos="fade-up"
                  data-aos-duration="800"
                >
                    {/* Red pulse background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-orange-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Animated scan */}
                    <motion.div
                      initial={{ left: "-100%" }}
                      animate={{ left: ["- 100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-red-400/10 to-transparent pointer-events-none"
                    />
                    {/* Warning triangle blink */}
                    <AlertTriangle className="w-4 h-4 text-red-400 group-hover:animate-pulse relative z-10" />
                    <span className="relative z-10 font-mono text-sm text-red-300 group-hover:text-red-200 transition-colors">
                      View CV
                    </span>
                    <Lock className="w-4 h-4 text-red-400/60 relative z-10" />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black border border-red-500/30 text-red-400 text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      Open CV
                    </div>
                </a>
              ) : (
                <button className="w-full lg:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-semibold cursor-not-allowed flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" /> CV Coming Soon
                </button>
              )}
              <a
                href="#Portofolio"
                className="w-full lg:w-auto px-8 py-3 rounded-xl border border-white/10 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 flex items-center justify-center gap-2"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <Code className="w-5 h-5" /> View Projects
              </a>
            </div>
          </div>

          <ProfileImage src={aboutImageUrl} name={displayName} />
        </div>

        <a href="#Portofolio">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16 cursor-pointer">
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </a>
      </div>
    </div>
  );
};

export default memo(AboutPage);

Header.propTypes = { subtitle: PropTypes.string };
ProfileImage.propTypes = { src: PropTypes.string, name: PropTypes.string };
