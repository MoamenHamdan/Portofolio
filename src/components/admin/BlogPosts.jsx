import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { compressImage } from "../../utils/imageUtils";
import {
  Plus, X, Edit2, Trash2, Upload, Loader2,
  CheckCircle, AlertCircle, Save, BookOpen, Calendar, Info
} from "lucide-react";

const defaultForm = {
  title: "",
  description: "",
  images: [],      // array of base64 or URLs
  date: "",
  tags: [],
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

// ── Tag Input ─────────────────────────────────────────────────────────
const TagInput = ({ label, tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t) { onAdd(t); setInput(""); } };
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <div className="flex gap-2">
        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
        <button type="button" onClick={add}
          className="px-3 py-2 rounded-xl bg-[#b91c1c]/20 hover:bg-[#b91c1c]/30 border border-[#b91c1c]/30 text-red-300 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs border border-white/10">
            {t}
            <button type="button" onClick={() => onRemove(i)} className="text-gray-500 hover:text-red-400 ml-1"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Multi-image Picker ────────────────────────────────────────────────
// Compresses images client-side before storing (canvas-based, no new dependencies)
// This conserves Firebase Storage quota — images are stored in Firestore as
// base64 or via external URL, NOT in Firebase Storage, so no Blaze upgrade needed.
const MultiImagePicker = ({ images, onChange }) => {
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setCompressing(true);
    try {
      const compressed = await Promise.all(
        files.map(f => compressImage(f, 900, 0.72))
      );
      onChange([...images, ...compressed]);
    } catch (err) {
      alert(err.message);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));

  const [urlInput, setUrlInput] = useState("");
  const addUrl = () => {
    const u = urlInput.trim();
    if (u) { onChange([...images, u]); setUrlInput(""); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/70 text-xs">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Images are compressed & stored in Firestore (free). For large photos, paste an Imgur URL.
      </div>
      {/* Existing images preview */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Upload more */}
      <div className="flex gap-2">
        <button type="button" onClick={() => !compressing && inputRef.current?.click()}
          disabled={compressing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:border-[#b91c1c]/40 transition-all disabled:opacity-50">
          {compressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {compressing ? "Compressing…" : "Upload Images"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      {/* URL input */}
      <div className="flex gap-2">
        <input type="url" value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="Or paste image URL and press Enter"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
        <button type="button" onClick={addUrl}
          className="px-3 py-2 rounded-xl bg-[#b91c1c]/20 hover:bg-[#b91c1c]/30 border border-[#b91c1c]/30 text-red-300 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Blog Post Modal ───────────────────────────────────────────────────
const BlogModal = ({ isOpen, onClose, onSaved, editPost }) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editPost
        ? { title: editPost.title || "", description: editPost.description || "", images: editPost.images || [], date: editPost.date || "", tags: editPost.tags || [], order: editPost.order ?? 0 }
        : defaultForm
      );
    }
  }, [isOpen, editPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editPost?.id) {
        await updateDoc(doc(db, "blogPosts", editPost.id), payload);
      } else {
        await addDoc(collection(db, "blogPosts"), payload);
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
      <div className="relative w-full max-w-2xl bg-[#060b1f] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{editPost ? "Edit Blog Post" : "Add Blog Post"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Post Title *</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. TryHackMe CTF Challenge — Write-up"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
            <textarea required rows={4} value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Full description of this event, workshop, or achievement…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all resize-none" />
          </div>

          {/* Date & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input type="date" value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Order</label>
              <input type="number" min="0" value={form.order}
                onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                placeholder="0, 1, 2…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
            </div>
          </div>

          {/* Tags */}
          <TagInput label="Tags"
            tags={form.tags}
            onAdd={(t) => setForm(f => ({ ...f, tags: [...f.tags, t] }))}
            onRemove={(i) => setForm(f => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))}
            placeholder="e.g. Workshop, CTF, Certification" />

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Images (Multiple Supported)</label>
            <MultiImagePicker
              images={form.images}
              onChange={(imgs) => setForm(f => ({ ...f, images: imgs }))} />
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
              {saving ? "Saving…" : editPost ? "Update" : "Add Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Blog Card ─────────────────────────────────────────────────────────
const BlogCard = ({ post, onEdit, onDelete }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-200">
    <div className="relative h-40 bg-gray-900 overflow-hidden">
      {post.images?.[0] ? (
        <img src={post.images[0]} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-700">
          <BookOpen className="w-10 h-10" />
        </div>
      )}
      {post.images?.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          +{post.images.length - 1} more
        </div>
      )}
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-white text-sm line-clamp-2">{post.title || "Untitled"}</h3>
      <p className="text-gray-400 text-xs line-clamp-2">{post.description}</p>
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((t, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[#b91c1c]/15 text-red-300 text-xs border border-[#b91c1c]/20">{t}</span>
          ))}
        </div>
      )}
      {post.date && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onEdit(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────
const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "blogPosts"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setPosts(data);
    } catch (err) {
      showToast("error", "Failed to load: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleOpen = (p = null) => { setEditPost(p); setModalOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post permanently?")) return;
    try {
      await deleteDoc(doc(db, "blogPosts", id));
      showToast("success", "Post deleted.");
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast("error", "Delete failed: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-red-400" /> Blog / Activity Log
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} · workshops, CTFs, certifications
          </p>
        </div>
        <button onClick={() => handleOpen()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
          <Plus className="w-4 h-4" /> Add Post
        </button>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/70 text-xs">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Blog posts support multiple images (great for workshop photo galleries). Images are compressed &amp; stored in Firestore for free.
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" /> Loading…
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
          <BookOpen className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No blog posts yet</p>
          <p className="text-xs mt-1">Log your SOC learning journey, CTF write-ups, workshops</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(p => (
            <BlogCard key={p.id} post={p} onEdit={handleOpen} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BlogModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditPost(null); }}
        onSaved={() => { fetchPosts(); showToast("success", editPost ? "Post updated!" : "Post added!"); }}
        editPost={editPost}
      />

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default BlogPosts;
