import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { compressImage } from "../../utils/imageUtils";
import {
    Plus, X, Edit2, Trash2, Upload, Star, Loader2,
    CheckCircle, AlertCircle, Save, User, MessageSquare, Briefcase
} from "lucide-react";

const defaultForm = {
    name: "",
    role: "",        // e.g. "CEO at Startup X"
    feedback: "",
    avatar: "",      // optional base64 or URL
    rating: 5,
    order: 0,
};

// ── Toast ─────────────────────────────────────────────────────────────
const Toast = ({ type, message, onDismiss }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
    ${type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
        {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="max-w-xs">{message}</span>
        <button onClick={onDismiss}><X className="w-4 h-4" /></button>
    </div>
);

// ── Star Rating Picker ────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onChange(star)}
                className={`w-7 h-7 transition-all duration-150 ${star <= value ? "text-yellow-400 scale-110" : "text-gray-600 hover:text-yellow-300"}`}>
                <Star className="w-6 h-6" fill={star <= value ? "currentColor" : "none"} />
            </button>
        ))}
    </div>
);

// ── Avatar Picker (optional, base64) ────────────────────────────────
const AvatarPicker = ({ value, onChange }) => {
    const [compressing, setCompressing] = useState(false);
    const inputRef = useRef();

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCompressing(true);
        try {
            // For avatars: small square, very compressed
            const base64 = await compressImage(file, 200, 0.7);
            onChange(base64);
        } catch (err) {
            alert(err.message);
        } finally {
            setCompressing(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Preview circle */}
            <div
                onClick={() => !compressing && inputRef.current?.click()}
                className="relative w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-[#b91c1c]/50 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group transition-all flex-shrink-0"
            >
                {value ? (
                    <>
                        <img src={value} alt="avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </>
                ) : compressing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                ) : (
                    <User className="w-6 h-6 text-gray-600 group-hover:text-gray-400 transition-colors" />
                )}
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Optional client photo</p>
                <p className="text-xs text-gray-600">Click to upload · or paste URL below</p>
                <input
                    type="url"
                    value={value?.startsWith("data:") ? "" : value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://i.imgur.com/..."
                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                />
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
};

// ── Testimonial Modal ────────────────────────────────────────────────
const TestimonialModal = ({ isOpen, onClose, onSaved, editItem }) => {
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(editItem
                ? { name: editItem.name || "", role: editItem.role || "", feedback: editItem.feedback || "", avatar: editItem.avatar || "", rating: editItem.rating ?? 5, order: editItem.order ?? 0 }
                : defaultForm
            );
        }
    }, [isOpen, editItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, order: Number(form.order), rating: Number(form.rating) };
            if (editItem?.id) {
                await updateDoc(doc(db, "testimonials", editItem.id), payload);
            } else {
                await addDoc(collection(db, "testimonials"), payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert("Error saving: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
            <div className="relative w-full max-w-lg bg-[#060b1f] border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">{editItem ? "Edit Testimonial" : "Add Client Testimonial"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Avatar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Client Photo (Optional)</label>
                        <AvatarPicker
                            value={form.avatar}
                            onChange={(v) => setForm(f => ({ ...f, avatar: v }))}
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Client Name *
                        </label>
                        <input type="text" required value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Ahmed Al Rashid"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Role / Company
                        </label>
                        <input type="text" value={form.role}
                            onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                            placeholder="e.g. CEO at TechStartup, Freelance Client"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> Testimonial *
                        </label>
                        <textarea required rows={4} value={form.feedback}
                            onChange={(e) => setForm(f => ({ ...f, feedback: e.target.value }))}
                            placeholder="What did the client say about working with you?"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all resize-none leading-relaxed" />
                    </div>

                    {/* Rating & Order */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                            <StarPicker value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Order</label>
                            <input type="number" min="0" value={form.order}
                                onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                                placeholder="0, 1, 2…"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving…" : editItem ? "Update" : "Add Testimonial"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Testimonial Card ──────────────────────────────────────────────────
const TestimonialCard = ({ item, onEdit, onDelete }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all group">
        {/* Stars */}
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= (item.rating || 5) ? "text-yellow-400" : "text-gray-700"}`}
                    fill={s <= (item.rating || 5) ? "currentColor" : "none"} />
            ))}
        </div>

        {/* Feedback */}
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 italic">"{item.feedback}"</p>

        {/* Client info */}
        <div className="flex items-center gap-3 pt-1">
            {item.avatar ? (
                <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b91c1c]/40 to-[#ef4444]/30 flex items-center justify-center flex-shrink-0 text-red-300 text-sm font-bold">
                    {item.name?.[0]?.toUpperCase() || "?"}
                </div>
            )}
            <div>
                <p className="text-white text-sm font-semibold">{item.name}</p>
                {item.role && <p className="text-gray-500 text-xs">{item.role}</p>}
            </div>
            {item.order !== undefined && (
                <div className="ml-auto w-6 h-6 rounded-full bg-white/10 text-gray-400 text-xs flex items-center justify-center">
                    {item.order}
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(item)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(item.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
        </div>
    </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────
const Testimonials = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const snap = await getDocs(collection(db, "testimonials"));
            const data = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            setItems(data);
        } catch (err) {
            showToast("error", "Failed to load: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpen = (item = null) => { setEditItem(item); setModalOpen(true); };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this testimonial?")) return;
        try {
            await deleteDoc(doc(db, "testimonials", id));
            showToast("success", "Testimonial deleted.");
            fetchData();
        } catch (err) {
            showToast("error", "Delete failed: " + err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Client Testimonials</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {items.length} testimonial{items.length !== 1 ? "s" : ""} · shown on portfolio
                    </p>
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
                    <Plus className="w-4 h-4" /> Add Testimonial
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" /> Loading…
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No testimonials yet</p>
                    <p className="text-xs mt-1">Add feedback from clients you've worked with</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(item => (
                        <TestimonialCard key={item.id} item={item} onEdit={handleOpen} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <TestimonialModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditItem(null); }}
                onSaved={() => { fetchData(); showToast("success", editItem ? "Updated!" : "Testimonial added!"); }}
                editItem={editItem}
            />

            {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default Testimonials;
