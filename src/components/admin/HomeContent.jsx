import { useState, useEffect, useRef } from "react";
import { db, doc, getDoc, setDoc, collection, getCountFromServer } from "../../firebase";
import { compressImage, assertDocumentSize } from "../../utils/imageUtils";
import {
    Save, Plus, X, Upload, Image, FileText, Type, Code2, Loader2,
    CheckCircle, AlertCircle, User, Info, FolderGit2, ShieldCheck, Clock
} from "lucide-react";

// ── Firestore doc ref ────────────────────────────────────────────────
const SETTINGS_DOC = (db) => doc(db, "siteSettings", "homeContent");

const defaultData = {
    displayName: "Moamen Hamdan", heroDescription: "", aboutSubtitle: "",
    aboutImageUrl: "", typingWords: [], techStack: [], heroImageUrl: "",
    aboutMeText: "", cvUrl: "", heroTitlePart1: "", heroTitlePart2: "", yearsOfExperience: 0,
};

// ── UI helpers ────────────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#b91c1c]/30 to-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-red-300" />
            </div>
            <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

const Toast = ({ type, message, onDismiss }) => (
    <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
      ${type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"}`}
    >
        {type === "success"
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        <span className="max-w-xs">{message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
        </button>
    </div>
);

// Tag input
const TagInput = ({ tags, onAdd, onRemove, placeholder }) => {
    const [input, setInput] = useState("");
    const add = () => {
        const t = input.trim();
        if (t && !tags.includes(t)) { onAdd(t); setInput(""); }
    };
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder={placeholder}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                />
                <button type="button" onClick={add}
                    className="px-4 py-2.5 rounded-xl bg-[#b91c1c]/20 hover:bg-[#b91c1c]/30 border border-[#b91c1c]/30 text-red-300 text-sm font-medium transition-all flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
                {tags.map((tag, i) => (
                    <span key={i}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">
                        {tag}
                        <button type="button" onClick={() => onRemove(i)}
                            className="text-gray-400 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

// Image picker — compresses to base64, stores in Firestore (free)
const ImagePicker = ({ label, currentUrl, onPicked, hint }) => {
    const [preview, setPreview] = useState(currentUrl || "");
    const [compressing, setCompressing] = useState(false);
    const [pasteUrl, setPasteUrl] = useState(currentUrl?.startsWith("data:") ? "" : currentUrl || "");
    const inputRef = useRef();

    useEffect(() => {
        if (!currentUrl?.startsWith("data:")) setPasteUrl(currentUrl || "");
        setPreview(currentUrl || "");
    }, [currentUrl]);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCompressing(true);
        try {
            const base64 = await compressImage(file, 900, 0.72);
            setPreview(base64);
            setPasteUrl("");
            onPicked(base64);
        } catch (err) {
            alert(err.message);
        } finally {
            setCompressing(false);
        }
    };

    const handleUrlChange = (url) => {
        setPasteUrl(url);
        setPreview(url);
        onPicked(url);
    };

    return (
        <div className="space-y-3">
            {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}

            {/* Upload box */}
            <div
                onClick={() => !compressing && inputRef.current?.click()}
                className={`relative flex items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed border-white/20
          hover:border-[#b91c1c]/50 bg-white/5 overflow-hidden group transition-all
          ${compressing ? "cursor-wait opacity-70" : "cursor-pointer"}`}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        {!compressing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
                                <Image className="w-4 h-4" /> Click to change
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 group-hover:text-gray-400 transition-colors">
                        {compressing
                            ? <><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-red-400" /><p className="text-sm">Compressing…</p></>
                            : <><Upload className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">Click to upload & compress</p><p className="text-xs mt-1 text-gray-600">Compressed before saving</p></>
                        }
                    </div>
                )}
                {compressing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
                    </div>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

            <div>
                <label className="block text-xs text-gray-500 mb-1">Or paste external image URL</label>
                <input
                    type="url" value={pasteUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://i.imgur.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                />
            </div>
            {hint && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/80 text-xs">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {hint}
                </div>
            )}
        </div>
    );
};

// ── MAIN ──────────────────────────────────────────────────────────────
const HomeContent = () => {
    const [data, setData] = useState(defaultData);
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [toast, setToast] = useState(null);
    const [liveCounts, setLiveCounts] = useState({ projects: null, certificates: null });

    const showToast = (type, msg) => {
        setToast({ type, message: msg });
        setTimeout(() => setToast(null), 5000);
    };

    // Load saved settings
    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDoc(SETTINGS_DOC(db));
                if (snap.exists()) { const saved = snap.data(); setData({ ...defaultData, ...saved, aboutImageUrl: saved.aboutImageUrl ?? saved.heroImageUrl ?? "" }); }
            } catch (err) {
                setLoadError(true);
                showToast("error", "Load failed: " + err.message);
            } finally {
                setFetching(false);
            }
        };
        load();
    }, []);

    // Auto-count projects and certificates from Firestore
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [projSnap, certSnap] = await Promise.all([
                    getCountFromServer(collection(db, "projects")),
                    getCountFromServer(collection(db, "certificates")),
                ]);
                setLiveCounts({
                    projects: projSnap.data().count,
                    certificates: certSnap.data().count,
                });
            } catch {
                // counts are cosmetic — silently skip on error
            }
        };
        fetchCounts();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            assertDocumentSize(data);
            await setDoc(SETTINGS_DOC(db), data, { merge: true });
            showToast("success", "All changes saved successfully!");
        } catch (err) {
            showToast("error", "Save failed: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin text-red-400 mr-3" />
                <span className="text-sm">Loading settings…</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Home Content</h1>
                    <p className="text-gray-400 text-sm mt-1">Content and compressed images saved in Firestore</p>
                </div>
                <button onClick={handleSave} disabled={saving || loadError}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </div>

            {/* Hero Titles */}
            <SectionCard icon={Type} title="Hero Section Title"
                subtitle="The main two-line title in the hero section (e.g. 'Back-End' and 'Developer')">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title Line 1</label>
                        <input
                            type="text" value={data.heroTitlePart1 || ""}
                            onChange={(e) => setData(d => ({ ...d, heroTitlePart1: e.target.value }))}
                            placeholder="e.g. Back-End"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title Line 2</label>
                        <input
                            type="text" value={data.heroTitlePart2 || ""}
                            onChange={(e) => setData(d => ({ ...d, heroTitlePart2: e.target.value }))}
                            placeholder="e.g. Developer"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Typing words */}
            <SectionCard icon={Type} title="Typing Animation Words"
                subtitle="These words cycle in the hero section (e.g. Bug-Hunter, Tech Enthusiast)">
                <TagInput
                    tags={data.typingWords}
                    onAdd={(w) => setData(d => ({ ...d, typingWords: [...d.typingWords, w] }))}
                    onRemove={(i) => setData(d => ({ ...d, typingWords: d.typingWords.filter((_, idx) => idx !== i) }))}
                    placeholder="e.g. Problem Solver"
                />
            </SectionCard>

            {/* Tech Stack */}
            <SectionCard icon={Code2} title="Tech Stack Badges"
                subtitle="Pill badges shown below your title (e.g. C#, ASP.NET)">
                <TagInput
                    tags={data.techStack}
                    onAdd={(t) => setData(d => ({ ...d, techStack: [...d.techStack, t] }))}
                    onRemove={(i) => setData(d => ({ ...d, techStack: d.techStack.filter((_, idx) => idx !== i) }))}
                    placeholder="e.g. SQL Server"
                />
            </SectionCard>

            {/* Hero Image */}
            <SectionCard icon={Image} title="Hero Profile Photo"
                subtitle="Shows on the right side of the hero section">
                <ImagePicker
                    currentUrl={data.heroImageUrl}
                    onPicked={(url) => setData(d => ({ ...d, heroImageUrl: url }))}
                    hint="Images are compressed before saving. You can also paste an image URL."
                />
            </SectionCard>

            {/* About Me */}
            <SectionCard icon={User} title="About Me Text"
                subtitle="The paragraph in your About section">
                <textarea rows={6} value={data.aboutMeText}
                    onChange={(e) => setData(d => ({ ...d, aboutMeText: e.target.value }))}
                    placeholder="Write something about yourself…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all resize-none leading-relaxed"
                />
                <p className="text-right text-xs text-gray-500">{data.aboutMeText.length} chars</p>
            </SectionCard>

            {/* CV Link */}
            <SectionCard icon={FileText} title="CV / Resume Download Link"
                subtitle="Paste a direct download URL (Google Drive, Dropbox, etc.) — no file upload needed">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/80 text-xs mb-3">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                        Upload your CV to <strong className="text-red-300">Google Drive</strong> → Share → "Anyone with link" → copy link,
                        then paste it here. This is 100% free.
                    </span>
                </div>
                <input
                    type="url" value={data.cvUrl}
                    onChange={(e) => setData(d => ({ ...d, cvUrl: e.target.value }))}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                />
                {data.cvUrl && (
                    <a href={data.cvUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 mt-2 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Test download link
                    </a>
                )}
            </SectionCard>

            {/* About Page Stats */}
            <SectionCard icon={FolderGit2} title="About Page Stats"
                subtitle="Project & Certificate counts are auto-calculated from what you upload. Only Years of Experience is manual.">

                {/* Live counters — read only */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-[#b91c1c]/20 flex items-center justify-center">
                            <FolderGit2 className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Total Projects</p>
                            <p className="text-2xl font-bold text-white">
                                {liveCounts.projects ?? <span className="text-gray-500 text-base">…</span>}
                            </p>
                        </div>
                        <span className="ml-auto text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-full">Auto</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Certificates</p>
                            <p className="text-2xl font-bold text-white">
                                {liveCounts.certificates ?? <span className="text-gray-500 text-base">…</span>}
                            </p>
                        </div>
                        <span className="ml-auto text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-full">Auto</span>
                    </div>
                </div>

                {/* Only Years of Experience is manual */}
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-400" /> Years of Experience
                    </label>
                    <input type="number" min="0" value={data.yearsOfExperience ?? 1}
                        onChange={(e) => setData(d => ({ ...d, yearsOfExperience: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Set this manually — it won't change automatically.</p>
                </div>
            </SectionCard>

            <SectionCard icon={User} title="Profile details" subtitle="These fields also control the public profile and navigation.">
                {[["displayName", "Display name"], ["heroDescription", "Hero description"], ["aboutSubtitle", "About subtitle"]].map(([field, label]) => (
                    <label key={field} className="block text-sm text-gray-300">{label}
                        <textarea value={data[field] ?? ""} onChange={e => setData(d => ({ ...d, [field]: e.target.value }))} className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 p-3" rows={field === "heroDescription" ? 3 : 1} />
                    </label>
                ))}
                <ImagePicker currentUrl={data.aboutImageUrl} onPicked={url => setData(d => ({ ...d, aboutImageUrl: url }))} label="About profile image" />
            </SectionCard>
            {loadError && <p role="alert" className="text-red-300">Settings could not be loaded. Reload this page before saving to protect your existing content.</p>}

            {/* Bottom save */}
            <div className="flex justify-end pb-10">
                <button onClick={handleSave} disabled={saving || loadError}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving…" : "Save All Changes"}
                </button>
            </div>

            {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default HomeContent;
