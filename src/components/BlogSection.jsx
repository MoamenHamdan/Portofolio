import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, collection, getDocs } from "../firebase";
import {
  BookOpen, Calendar, Tag, X, ChevronLeft, ChevronRight,
  ArrowUpRight, ExternalLink, Shield, Cpu
} from "lucide-react";
import AOS from "aos";

// Tag colour mapping for the SOC/dev context
const TAG_COLOURS = {
  "CTF":           "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-300",
  "Workshop":      "from-red-500/20 to-red-500/10 border-red-500/30 text-red-300",
  "Certification": "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-300",
  "SOC":           "from-red-500/20 to-red-500/10 border-red-500/30 text-red-300",
  "Dev":           "from-red-500/20 to-red-500/10 border-red-500/30 text-red-300",
  "TryHackMe":     "from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-300",
  "HackTheBox":    "from-green-500/20 to-red-500/10 border-green-500/30 text-green-300",
};

const tagClass = (tag) =>
  TAG_COLOURS[tag] || "from-white/10 to-white/5 border-white/20 text-gray-300";

// ── Mini image carousel inside modal ──────────────────────────────────
const ImageCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/30 mb-6">
      <img
        src={images[idx]}
        alt={`slide-${idx}`}
        className="w-full max-h-72 object-contain"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? "w-5 h-1.5 bg-red-400" : "w-1.5 h-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Post modal ────────────────────────────────────────────────────────
const PostModal = ({ post, onClose }) => {
  if (!post) return null;
  const images = post.images?.filter(Boolean) || [];

  useEffect(() => {
    // Lock page scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);

    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 py-8"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#060b1f] border border-white/10 rounded-3xl shadow-2xl"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(t => (
                <span key={t} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r border text-xs font-medium ${tagClass(t)}`}>
                  <Tag className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{post.title}</h2>

          {post.date && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          {/* Images */}
          {images.length > 0 && <ImageCarousel images={images} />}

          {/* Body */}
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {post.body || post.summary}
          </div>

          {post.externalLink && (
            <a
              href={post.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> View Write-up
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Post card ─────────────────────────────────────────────────────────
const PostCard = ({ post, onClick }) => {
  const coverImg = post.images?.find(Boolean);
  // Disable whileHover on touch devices to prevent scroll jank
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  return (
    <motion.div
      onClick={onClick}
      whileHover={isTouch ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group cursor-pointer bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Cover image — uniform 16:9 aspect ratio for all cards */}
      <div className="relative w-full overflow-hidden bg-black/20" style={{ paddingTop: '56.25%' }}>
        {coverImg ? (
          <>
            <img
              src={coverImg}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#b91c1c]/10 to-[#ef4444]/10">
            <BookOpen className="w-10 h-10 text-red-400/40" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map(t => (
              <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r border text-[10px] font-medium ${tagClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base font-semibold text-white group-hover:text-red-300 transition-colors leading-snug mb-2 line-clamp-2">
          {post.title}
        </h3>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          {post.date && (
            <span className="flex items-center gap-1 text-[10px] text-gray-600">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-red-400 group-hover:gap-2 transition-all duration-200">
            Read more <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main section ──────────────────────────────────────────────────────
const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    AOS.init({ once: true });
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, "blogPosts"));
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => p.published !== false)   // respect published flag
          .sort((a, b) => {
            // Sort by order first, then by date desc
            if ((a.order ?? 999) !== (b.order ?? 999)) return (a.order ?? 999) - (b.order ?? 999);
            return new Date(b.date || 0) - new Date(a.date || 0);
          });
        setPosts(data);
      } catch (err) {
        console.warn("Could not load blog posts:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || posts.length === 0) return null;

  // Collect all unique tags
  const allTags = ["All", ...new Set(posts.flatMap(p => p.tags || []))];

  const filtered = activeTag === "All" ? posts : posts.filter(p => p.tags?.includes(activeTag));
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section
      id="Blog"
      className="py-16 md:py-24 px-[5%] md:px-[10%] overflow-hidden text-white"
      data-aos="fade-up"
    >
      {/* Header */}
      <div className="text-center mb-10" data-aos="fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium mb-4">
          <Shield className="w-3.5 h-3.5" />
          Activity Log & Write-ups
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b91c1c] to-[#ef4444]">
          Field Notes
        </h2>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm md:text-base">
          CTF write-ups, certifications, workshops and SOC learning milestones.
        </p>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => { setActiveTag(tag); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                ${activeTag === tag
                  ? "bg-gradient-to-r from-[#b91c1c] to-[#ef4444] border-transparent text-white shadow-lg shadow-red-500/20"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map((post, i) => (
          <div key={post.id} data-aos="fade-up" data-aos-delay={i < 3 ? i * 80 : 0}>
            <PostCard post={post} onClick={() => setSelectedPost(post)} />
          </div>
        ))}
      </div>

      {/* Show more/less */}
      {filtered.length > 6 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 text-sm font-medium transition-all duration-200"
          >
            {showAll ? "Show Less" : `Show ${filtered.length - 6} More`}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showAll ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;
