import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, collection, getDocs } from "../firebase";
import { Star, Quote, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import AOS from "aos";

// ── Unknown-person SVG (used when no avatar or image fails to load) ────
const UnknownAvatar = ({ size = 48 }) => (
    <svg
        width={size} height={size} viewBox="0 0 48 48"
        className="rounded-full flex-shrink-0"
        style={{
            background: "linear-gradient(135deg,rgba(185,28,28,0.2),rgba(239,68,68,0.1))",
            border: "2px solid rgba(255,255,255,0.12)"
        }}
    >
        {/* head */}
        <circle cx="24" cy="17" r="10" fill="rgba(239,68,68,0.4)" />
        {/* shoulders */}
        <ellipse cx="24" cy="40" rx="15" ry="11" fill="rgba(239,68,68,0.3)" />
    </svg>
);

// ── Avatar with onError fallback ──────────────────────────────────────
const AvatarImg = ({ src, name, size = 48 }) => {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <UnknownAvatar size={size} />;
    return (
        <img
            src={src}
            alt={name || "Client"}
            onError={() => setFailed(true)}
            width={size}
            height={size}
            className="rounded-full object-cover flex-shrink-0 border-2 border-white/10"
            style={{ width: size, height: size }}
        />
    );
};

// ── Main Section ──────────────────────────────────────────────────────
const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(null);

    useEffect(() => {
        AOS.init({ once: true });
        const fetchData = async () => {
            try {
                const snap = await getDocs(collection(db, "testimonials"));
                const data = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                setTestimonials(data);
            } catch (err) {
                console.warn("Could not load testimonials:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const defaultTestimonials = [
        {
            id: "default-1",
            name: "Security Architect",
            role: "Project Mentorship",
            feedback: "Moamen has a sharp eye for analyzing security logs and implementing robust, clean infrastructure solutions. A promising SOC analyst candidate.",
            rating: 5,
        },
    ];

    const displayTestimonials =
        testimonials.length > 0 ? testimonials : defaultTestimonials;

    if (loading) return null;

    const prev = () =>
        setCurrent(c => (c - 1 + displayTestimonials.length) % displayTestimonials.length);
    const next = () =>
        setCurrent(c => (c + 1) % displayTestimonials.length);

    const onPointerDown = e => {
        dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
        setIsDragging(true);
    };
    const onPointerUp = e => {
        if (!isDragging || dragStartX.current === null) return;
        const endX = e.clientX ?? e.changedTouches?.[0]?.clientX;
        const diff = dragStartX.current - endX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        dragStartX.current = null;
        setIsDragging(false);
    };

    const item = displayTestimonials[current] || defaultTestimonials[0];

    return (
        <section
            id="Testimonials"
            className="text-white py-16 md:py-24 px-[5%] md:px-[10%] overflow-hidden"
        >
            {/* Header */}
            <div className="text-center mb-12" data-aos="fade-up">
                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b91c1c] to-[#ef4444]">
                    Client Testimonials
                </h2>
                <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm md:text-base">
                    What people I've worked with say about the experience.
                </p>
            </div>

            {/* Carousel wrapper */}
            <div
                className="relative max-w-3xl mx-auto"
                onMouseDown={onPointerDown}
                onMouseUp={onPointerUp}
                onTouchStart={onPointerDown}
                onTouchEnd={onPointerUp}
                data-aos="zoom-in-up"
            >
                {/* Card — auto height, no clipping */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-green-500/20 rounded-3xl p-8 md:p-12 shadow-2xl select-none transition-colors duration-300">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-green-500/30 rounded-tl-3xl" />
                            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-500/30 rounded-tr-3xl" />
                            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-500/30 rounded-bl-3xl" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-green-500/30 rounded-br-3xl" />

                            {/* Gradient glow overlay */}
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#b91c1c]/10 via-transparent to-[#ef4444]/10 pointer-events-none" />

                            {/* Verified badge */}
                            <div className="absolute top-4 left-8 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-green-500/20 text-green-400 text-[9px] font-mono">
                                <Shield className="w-2 h-2" /> VERIFIED
                            </div>

                            {/* Decorative quote */}
                            <Quote className="absolute top-6 right-8 w-10 h-10 text-red-500/10" />

                            {/* ── Content ── */}
                            <div className="flex flex-col gap-5 mt-4">
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 transition-colors ${s <= (item.rating || 5)
                                                ? "text-yellow-400"
                                                : "text-gray-800"}`}
                                            fill={s <= (item.rating || 5) ? "currentColor" : "none"}
                                        />
                                    ))}
                                </div>

                                {/* Feedback — full text, no line-clamp */}
                                <p className="text-gray-200 text-base md:text-lg leading-relaxed italic">
                                    &ldquo;{item.feedback}&rdquo;
                                </p>

                                {/* Client info — always fully visible */}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <AvatarImg src={item.avatar} name={item.name} size={52} />
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-base leading-tight">
                                            {item.name || "Anonymous"}
                                        </p>
                                        {item.role && (
                                            <p className="text-gray-400 text-sm mt-0.5">
                                                {item.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation dots + arrows */}
                {displayTestimonials.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2">
                            {displayTestimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`transition-all duration-300 rounded-full ${i === current
                                        ? "w-6 h-2 bg-gradient-to-r from-[#b91c1c] to-[#ef4444]"
                                        : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
