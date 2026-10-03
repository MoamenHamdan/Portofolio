import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { compressImage, assertDocumentSize } from "../../utils/imageUtils";
import {
    Plus, X, Edit2, Trash2, Upload, Image, Loader2,
    CheckCircle, AlertCircle, Save, Cpu, Info
} from "lucide-react";

const defaultForm = {
    language: "",   // display name, e.g. "C#"
    icon: "",       // base64 or URL of the icon image
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

// ── Icon Picker ──────────────────────────────────────────────────────
const IconPicker = ({ value, onChange }) => {
    const [compressing, setCompressing] = useState(false);
    const inputRef = useRef();

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCompressing(true);
        try {
            // Skill icons: tiny square, heavily compressed
            const base64 = await compressImage(file, 128, 0.8);
            onChange(base64);
        } catch (err) {
            alert(err.message);
        } finally {
            setCompressing(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div
                onClick={() => !compressing && inputRef.current?.click()}
                className="relative w-16 h-16 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#b91c1c]/50 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group transition-all flex-shrink-0"
            >
                {value ? (
                    <>
                        <img src={value} alt="icon" className="w-10 h-10 object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </>
                ) : compressing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                ) : (
                    <Image className="w-6 h-6 text-gray-600 group-hover:text-gray-400 transition-colors" />
                )}
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Upload skill icon (PNG, JPEG or WebP)</p>
                <input
                    type="url"
                    value={value?.startsWith("data:") ? "" : value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Or paste icon URL…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                />
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </div>
    );
};

// ── Skill Modal ───────────────────────────────────────────────────────
const SkillModal = ({ isOpen, onClose, onSaved, editSkill }) => {
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(editSkill
                ? { language: editSkill.language || "", icon: editSkill.icon || "", order: editSkill.order ?? 0 }
                : defaultForm
            );
        }
    }, [isOpen, editSkill]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, order: Number(form.order) };
            assertDocumentSize(payload);
            if (editSkill?.id) {
                await updateDoc(doc(db, "skills", editSkill.id), payload);
            } else {
                await addDoc(collection(db, "skills"), payload);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md bg-[#060b1f] border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">{editSkill ? "Edit Skill" : "Add Skill"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Skill name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Skill / Technology Name *</label>
                        <input type="text" required value={form.language}
                            onChange={(e) => setForm(f => ({ ...f, language: e.target.value }))}
                            placeholder="e.g. C#, ASP.NET, Docker"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Skill Icon</label>
                        <IconPicker value={form.icon} onChange={(v) => setForm(f => ({ ...f, icon: v }))} />
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Order</label>
                        <input type="number" min="0" value={form.order}
                            onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                            placeholder="0, 1, 2…"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving…" : editSkill ? "Update" : "Add Skill"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Skill Card ────────────────────────────────────────────────────────
const SkillCard = ({ skill, onEdit, onDelete }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-white/20 transition-all group relative">
        {skill.order !== undefined && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 text-gray-500 text-xs flex items-center justify-center">
                {skill.order}
            </div>
        )}
        {skill.icon ? (
            <img src={skill.icon} alt={skill.language} className="w-12 h-12 object-contain" />
        ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b91c1c]/20 to-[#ef4444]/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-red-400" />
            </div>
        )}
        <p className="text-sm font-medium text-gray-300 text-center">{skill.language}</p>
        <div className="flex gap-2 w-full">
            <button onClick={() => onEdit(skill)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
                <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button onClick={() => onDelete(skill.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
                <Trash2 className="w-3 h-3" /> Del
            </button>
        </div>
    </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────
const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editSkill, setEditSkill] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const fetchSkills = useCallback(async () => {
        try {
            const snap = await getDocs(collection(db, "skills"));
            const data = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            setSkills(data);
        } catch (err) {
            showToast("error", "Failed to load: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchSkills(); }, [fetchSkills]);

    const handleOpen = (s = null) => { setEditSkill(s); setModalOpen(true); };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this skill?")) return;
        try {
            await deleteDoc(doc(db, "skills", id));
            showToast("success", "Skill deleted.");
            fetchSkills();
        } catch (err) {
            showToast("error", "Delete failed: " + err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tech Stack / Skills</h1>
                    <p className="text-gray-400 text-sm mt-1">{skills.length} skill{skills.length !== 1 ? "s" : ""} · shown in Portfolio Tech Stack tab</p>
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
                    <Plus className="w-4 h-4" /> Add Skill
                </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/70 text-xs">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Skill icons are compressed before saving. Use the order number to arrange them. Changes appear live on your portfolio.
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" /> Loading…
                </div>
            ) : skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
                    <Cpu className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No skills yet</p>
                    <p className="text-xs mt-1">Add your first tech skill with an icon</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {skills.map(s => (
                        <SkillCard key={s.id} skill={s} onEdit={handleOpen} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <SkillModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditSkill(null); }}
                onSaved={() => { fetchSkills(); showToast("success", editSkill ? "Updated!" : "Skill added!"); }}
                editSkill={editSkill}
            />

            {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default Skills;
