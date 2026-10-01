import { useState, useEffect } from "react";
import { db, doc, getDoc, setDoc } from "../../firebase";
import {
  Save, Plus, X, Loader2, CheckCircle, AlertCircle,
  Link2, Share2, Trash2, GripVertical, Globe
} from "lucide-react";

import { validateUrl } from "../../utils/adminGuard";

// Curated list of popular social platforms with their colors
const PLATFORM_OPTIONS = [
  { value: "github",    label: "GitHub",       color: "#ffffff", gradient: "from-[#333] to-[#24292e]" },
  { value: "linkedin",  label: "LinkedIn",     color: "#0A66C2", gradient: "from-[#0A66C2] to-[#0077B5]" },
  { value: "instagram", label: "Instagram",    color: "#E4405F", gradient: "from-[#833AB4] via-[#E4405F] to-[#FCAF45]" },
  { value: "twitter",   label: "Twitter / X",  color: "#1DA1F2", gradient: "from-[#1DA1F2] to-[#0d8ecf]" },
  { value: "youtube",   label: "YouTube",      color: "#FF0000", gradient: "from-[#FF0000] to-[#CC0000]" },
  { value: "tiktok",    label: "TikTok",       color: "#FE2C55", gradient: "from-[#000000] via-[#25F4EE] to-[#FE2C55]" },
  { value: "medium",    label: "Medium",       color: "#00ab6c", gradient: "from-[#00ab6c] to-[#00874f]" },
  { value: "devto",     label: "Dev.to",       color: "#ef4444", gradient: "from-[#ef4444] to-[#b91c1c]" },
  { value: "tryhackme", label: "TryHackMe",    color: "#c11111", gradient: "from-[#c11111] to-[#8b0000]" },
  { value: "hackthebox",label: "HackTheBox",   color: "#9fef00", gradient: "from-[#9fef00] to-[#5cb85c]" },
  { value: "telegram",  label: "Telegram",     color: "#2CA5E0", gradient: "from-[#2CA5E0] to-[#006494]" },
  { value: "discord",   label: "Discord",      color: "#5865F2", gradient: "from-[#5865F2] to-[#4752c4]" },
  { value: "custom",    label: "Custom",       color: "#ef4444", gradient: "from-[#b91c1c] to-[#ef4444]" },
];

const SETTINGS_DOC = (db) => doc(db, "siteSettings", "socialLinks");

const defaultLinks = [];

const Toast = ({ type, message, onDismiss }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
    ${type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
    {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span>{message}</span>
    <button onClick={onDismiss}><X className="w-4 h-4" /></button>
  </div>
);

const SocialLinksManager = () => {
  const [links, setLinks] = useState(defaultLinks);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [newLink, setNewLink] = useState({ platform: "github", label: "", url: "", customColor: "#ef4444" });

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(SETTINGS_DOC(db));
        if (snap.exists() && Array.isArray(snap.data().links)) {
          setLinks(snap.data().links);
        }
      } catch (err) {
        showToast("error", "Load failed: " + err.message);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(SETTINGS_DOC(db), { links }, { merge: true });
      showToast("success", "Social links saved!");
    } catch (err) {
      showToast("error", "Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    // Sanitize & validate URL
    const { valid, sanitized, error: urlError } = validateUrl(newLink.url);
    if (!valid) { showToast("error", urlError || "Invalid URL."); return; }

    const platform = PLATFORM_OPTIONS.find(p => p.value === newLink.platform) || PLATFORM_OPTIONS[PLATFORM_OPTIONS.length - 1];
    const label = newLink.label.trim().replace(/<[^>]*>/g, "").slice(0, 50) || platform.label;

    // Max 20 links
    if (links.length >= 20) { showToast("error", "Maximum 20 links allowed."); return; }

    setLinks(prev => [...prev, {
      id: Date.now().toString(),
      platform: newLink.platform,
      label,
      url: sanitized,
      color: newLink.platform === "custom" ? newLink.customColor : platform.color,
      gradient: platform.gradient,
    }]);
    setNewLink({ platform: "github", label: "", url: "", customColor: "#ef4444" });
  };

  const removeLink = (id) => setLinks(prev => prev.filter(l => l.id !== id));

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin text-red-400 mr-3" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  const selectedPlatform = PLATFORM_OPTIONS.find(p => p.value === newLink.platform);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Links</h1>
          <p className="text-gray-400 text-sm mt-1">Links appear in the Hero section. Drag to reorder.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Add New Link */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#b91c1c]/30 to-[#ef4444]/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-red-300" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Add Social Account</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose a platform, enter your profile URL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Platform picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Platform</label>
            <select
              value={newLink.platform}
              onChange={e => setNewLink(n => ({ ...n, platform: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all appearance-none"
            >
              {PLATFORM_OPTIONS.map(p => (
                <option key={p.value} value={p.value} className="bg-[#0d0d1a] text-white">{p.label}</option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Label <span className="text-gray-500">(optional)</span></label>
            <input
              type="text"
              value={newLink.label}
              onChange={e => setNewLink(n => ({ ...n, label: e.target.value.slice(0, 50) }))}
              placeholder={selectedPlatform?.label || "e.g. My GitHub"}
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* URL */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Profile URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="url"
                value={newLink.url}
                onChange={e => setNewLink(n => ({ ...n, url: e.target.value }))}
                placeholder="https://github.com/yourusername"
                maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
              />
            </div>
          </div>

          {/* Custom color (only for "custom" platform) */}
          {newLink.platform === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Icon Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newLink.customColor}
                  onChange={e => setNewLink(n => ({ ...n, customColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <span className="text-sm text-gray-400">{newLink.customColor}</span>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={addLink}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b91c1c]/20 hover:bg-[#b91c1c]/30 border border-[#b91c1c]/30 text-red-300 text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {/* Current Links */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#b91c1c]/30 to-[#ef4444]/20 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-red-300" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Current Links ({links.length}/20)</h2>
            <p className="text-xs text-gray-500 mt-0.5">These will appear in the Hero section</p>
          </div>
        </div>

        {links.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No social links yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link, i) => {
              const platform = PLATFORM_OPTIONS.find(p => p.value === link.platform);
              return (
                <div key={link.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all group">
                  <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: link.color || "#ef4444" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{link.label || platform?.label || link.platform}</p>
                    <p className="text-gray-500 text-xs truncate flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> {link.url}
                    </p>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded border border-white/5 hover:border-red-400/20">
                    Test
                  </a>
                  <button
                    onClick={() => removeLink(link.id || String(i))}
                    className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end pb-10">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default SocialLinksManager;
