import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { compressImage } from "../../utils/imageUtils";
import {
  Plus, X, Edit2, Trash2, Upload, Image, Github, Link,
  Loader2, CheckCircle, AlertCircle, Save, FileText, Info, GripVertical
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const defaultForm = {
  Title: "",
  Description: "",
  Features: [],
  TechStack: [],
  Img: "",
  Link: "",
  Github: "",
};

// ── Toast ────────────────────────────────────────────────────────────
const Toast = ({ type, message, onDismiss }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
    ${type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
    {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span className="max-w-xs">{message}</span>
    <button onClick={onDismiss}><X className="w-4 h-4" /></button>
  </div>
);

// ── Tag Input ────────────────────────────────────────────────────────
const TagInput = ({ label, tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t) { onAdd(t); setInput(""); }
  };
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
            <button type="button" onClick={() => onRemove(i)} className="text-gray-500 hover:text-red-400 ml-1">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Image picker (base64, no Firebase Storage) ───────────────────────
const ImagePickerInline = ({ value, onChange }) => {
  const [compressing, setCompressing] = useState(false);
  const [pasteUrl, setPasteUrl] = useState(value?.startsWith("data:") ? "" : value || "");
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    try {
      const base64 = await compressImage(file, 900, 0.72);
      setPasteUrl("");
      onChange(base64);
    } catch (err) {
      alert(err.message);
    } finally {
      setCompressing(false);
    }
  };

  const handleUrlChange = (url) => {
    setPasteUrl(url);
    onChange(url);
  };

  const preview = value || "";

  return (
    <div className="space-y-2">
      <div onClick={() => !compressing && inputRef.current?.click()}
        className={`relative flex items-center justify-center h-36 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#b91c1c]/50 bg-white/5 overflow-hidden group transition-all ${compressing ? "cursor-wait" : "cursor-pointer"}`}>
        {preview ? (
          <>
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            {!compressing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-2">
                <Image className="w-4 h-4" /> Change image
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 group-hover:text-gray-400 transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs">Upload image (auto-compressed)</p>
          </div>
        )}
        {compressing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-red-300 text-xs">
            <Loader2 className="w-5 h-5 animate-spin" /> Compressing…
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <input type="url" value={pasteUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="Or paste image URL (imgur, postimages, etc.)"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
    </div>
  );
};

// ── Project Modal ────────────────────────────────────────────────────
const ProjectModal = ({ isOpen, onClose, onSaved, editProject }) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editProject
        ? { Title: editProject.Title || "", Description: editProject.Description || "", Features: editProject.Features || [], TechStack: editProject.TechStack || [], Img: editProject.Img || "", Link: editProject.Link || "", Github: editProject.Github || "" }
        : defaultForm
      );
    }
  }, [isOpen, editProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProject?.id) {
        await updateDoc(doc(db, "projects", editProject.id), form);
      } else {
        await addDoc(collection(db, "projects"), form);
      }
      onSaved();
      onClose();
    } catch (err) {
      alert("Error saving project: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="relative w-full max-w-2xl bg-[#060b1f] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{editProject ? "Edit Project" : "Add New Project"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Title *</label>
            <input type="text" required value={form.Title}
              onChange={(e) => setForm(f => ({ ...f, Title: e.target.value }))}
              placeholder="My Awesome Project"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
            <textarea required rows={3} value={form.Description}
              onChange={(e) => setForm(f => ({ ...f, Description: e.target.value }))}
              placeholder="What does this project do?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all resize-none" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Image</label>
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/70 text-xs mb-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Uploaded images are compressed & stored in Firestore for free. For large hi-res photos, paste an Imgur URL.
            </div>
            <ImagePickerInline
              value={form.Img}
              onChange={(v) => setForm(f => ({ ...f, Img: v }))} />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5" /> Live Demo URL
              </label>
              <input type="url" value={form.Link}
                onChange={(e) => setForm(f => ({ ...f, Link: e.target.value }))}
                placeholder="https://your-demo.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" /> GitHub URL
              </label>
              <input type="text" value={form.Github}
                onChange={(e) => setForm(f => ({ ...f, Github: e.target.value }))}
                placeholder="https://github.com/... or Private"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
            </div>
          </div>

          {/* Tech Stack */}
          <TagInput label="Tech Stack"
            tags={form.TechStack}
            onAdd={(t) => setForm(f => ({ ...f, TechStack: [...f.TechStack, t] }))}
            onRemove={(i) => setForm(f => ({ ...f, TechStack: f.TechStack.filter((_, idx) => idx !== i) }))}
            placeholder="e.g. React, C#, PostgreSQL" />

          {/* Features */}
          <TagInput label="Key Features"
            tags={form.Features}
            onAdd={(t) => setForm(f => ({ ...f, Features: [...f.Features, t] }))}
            onRemove={(i) => setForm(f => ({ ...f, Features: f.Features.filter((_, idx) => idx !== i) }))}
            placeholder="e.g. JWT authentication" />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : editProject ? "Update" : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Project Card ─────────────────────────────────────────────────────
const ProjectCard = ({ project, onEdit, onDelete }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-200">
    <div className="relative h-44 bg-gray-900 overflow-hidden">
      {project.Img ? (
        <img src={project.Img} alt={project.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-700"><Image className="w-10 h-10" /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
    <div className="p-4 space-y-3">
      <h3 className="font-semibold text-white text-base line-clamp-1">{project.Title || "Untitled"}</h3>
      <p className="text-gray-400 text-xs line-clamp-2">{project.Description}</p>
      {project.TechStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.TechStack.slice(0, 4).map((t, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[#b91c1c]/15 text-red-300 text-xs border border-[#b91c1c]/20">{t}</span>
          ))}
          {project.TechStack.length > 4 && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-xs">+{project.TechStack.length - 4}</span>
          )}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onEdit(project)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(project.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Sortable wrapper ──────────────────────────────────────────────────
const SortableProjectCard = ({ project, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes} {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <ProjectCard project={project} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

// ── MAIN ─────────────────────────────────────────────────────────────
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "projects"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setProjects(data);
    } catch (err) {
      showToast("error", "Failed to load: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const persistOrder = async (ordered) => {
    setOrderSaving(true);
    try {
      await Promise.all(ordered.map((p, idx) => updateDoc(doc(db, "projects", p.id), { order: idx })));
      showToast("success", "Order saved!");
    } catch (err) {
      showToast("error", "Could not save order: " + err.message);
    } finally {
      setOrderSaving(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setProjects(prev => {
      const reordered = arrayMove(prev, prev.findIndex(p => p.id === active.id), prev.findIndex(p => p.id === over.id));
      persistOrder(reordered);
      return reordered;
    });
  };

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleOpen = (p = null) => { setEditProject(p); setModalOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      showToast("success", "Project deleted.");
      fetchProjects();
    } catch (err) {
      showToast("error", "Delete failed: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} ·
            <span className="text-red-400 ml-1">drag to reorder</span>
            {orderSaving && <span className="text-yellow-400 ml-2 animate-pulse">saving order…</span>}
          </p>
        </div>
        <button onClick={() => handleOpen()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" /> Loading…
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No projects yet. Add your first one!</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map(p => (
                <SortableProjectCard key={p.id} project={p} onEdit={handleOpen} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditProject(null); }}
        onSaved={() => { fetchProjects(); showToast("success", editProject ? "Project updated!" : "Project added!"); }}
        editProject={editProject}
      />

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default Projects;
