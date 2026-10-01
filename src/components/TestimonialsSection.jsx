import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, collection, getDocs } from "../firebase";
import { Star, Quote, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import AOS from "aos";

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(null);

    useEffect(() => {
        AOS.init({ once: true });
        const fetch = async () => {
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
        fetch();
    }, []);

    const displayTestimonials = testimonials;
    if (loading || !testimonials.length) return <section id="Testimonials" className="px-[5%] py-12 text-center text-gray-400"><h2 className="text-2xl text-white">Client Testimonials</h2><p role="status">{loading ? "Loading reviews…" : "No reviews available."}</p></section>;

    const prev = () => setCurrent(c => (c - 1 + displayTestimonials.length) % displayTestimonials.length);
    const next = () => setCurrent(c => (c + 1) % displayTestimonials.length);

    // Touch/mouse swipe
    const onPointerDown = (e) => {
        dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
        setIsDragging(true);
    };
    const onPointerUp = (e) => {
        if (!isDragging || dragStartX.current === null) return;
        const endX = e.clientX ?? e.changedTouches?.[0]?.clientX;
        const diff = dragStartX.current - endX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        dragStartX.current = null;
        setIsDragging(false);
    };

    const item = displayTestimonials[current] || displayTestimonials[0];

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

            {/* Carousel */}
            <div
                className="relative max-w-3xl mx-auto"
                onMouseDown={onPointerDown} onMouseUp={onPointerUp}
                onTouchStart={onPointerDown} onTouchEnd={onPointerUp}
                data-aos="zoom-in-up"
            >
                <div className="relative overflow-hidden h-auto min-h-[350px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="w-full h-full"
                        >
                            <div className="relative bg-white/2 backdrop-blur-xl border border-white/5 hover:border-green-500/20 rounded-3xl p-8 md:p-12 shadow-2xl select-none h-full transition-colors duration-300">
                                {/* Cyber corner brackets */}
                                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-green-500/30 rounded-tl-3xl" />
                                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-green-500/30 rounded-tr-3xl" />
                                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-green-500/30 rounded-bl-3xl" />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-green-500/30 rounded-br-3xl" />

                                {/* Gradient glow */}
                                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#b91c1c]/10 via-transparent to-[#ef4444]/10 pointer-events-none" />

                                {/* Verified badge */}
                                <div className="absolute top-4 left-8 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-green-500/20 text-green-400 text-[9px] font-mono">
                                    <Shield className="w-2 h-2" /> VERIFIED
                                </div>

                                {/* Quote icon */}
                                <Quote className="absolute top-6 right-8 w-10 h-10 text-red-500/10" />

                                {/* Stars */}
                                <div className="flex gap-1 mb-5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 transition-colors ${s <= (item.rating || 5) ? "text-yellow-400" : "text-gray-800"}`}
                                            fill={s <= (item.rating || 5) ? "currentColor" : "none"}
                                        />
                                    ))}
                                </div>

                                {/* Feedback text */}
                                <p className="text-gray-200 text-base md:text-lg leading-relaxed italic mb-8">
                                    "{item.feedback}"
                                </p>

                                {/* Client info */}
                                <div className="flex items-center gap-4 mt-auto">
                                    {item.avatar ? (
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white/10 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b91c1c]/30 to-[#ef4444]/20 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 border border-white/5">
                                            {item.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-semibold">{item.name}</p>
                                        {item.role && <p className="text-gray-500 text-sm">{item.role}</p>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                {displayTestimonials.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {displayTestimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`transition-all duration-300 rounded-full ${i === current
                                        ? "w-6 h-2 bg-gradient-to-r from-[#b91c1c] to-[#ef4444]"
                                        : "w-2 h-2 bg-white/20 hover:bg-white/40"
                                        }`}
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
