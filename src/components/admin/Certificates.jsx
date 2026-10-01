import { useState, useEffect, useRef, useCallback } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { compressImage } from "../../utils/imageUtils";
import {
  Plus, X, Edit2, Trash2, Upload, Image, Award, Loader2,
  CheckCircle, AlertCircle, Save, Calendar, GripVertical, Info
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const defaultForm = {
  name: "",
  issuer: "",
  date: "",
  image: "",
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

// ── Image picker (base64, no Firebase Storage) ─────────────────────
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
            <img src={preview} alt="preview" className="w-full h-full object-contain p-2" />
            {!compressing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-2">
                <Image className="w-4 h-4" /> Change
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
        placeholder="Or paste image URL (imgur, etc.)"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
    </div>
  );
};

// ── Cert Modal ────────────────────────────────────────────────────────
const CertModal = ({ isOpen, onClose, onSaved, editCert }) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editCert
        ? { name: editCert.name || "", issuer: editCert.issuer || "", date: editCert.date || "", image: editCert.image || "", order: editCert.order ?? 0 }
        : defaultForm
      );
    }
  }, [isOpen, editCert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editCert?.id) {
        await updateDoc(doc(db, "certificates", editCert.id), payload);
      } else {
        await addDoc(collection(db, "certificates"), payload);
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
          <h2 className="text-lg font-bold text-white">{editCert ? "Edit Certificate" : "Add Certificate"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Certificate Name *</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. AWS Certified Developer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Issuing Organization</label>
            <input type="text" value={form.issuer}
              onChange={(e) => setForm(f => ({ ...f, issuer: e.target.value }))}
              placeholder="e.g. Coursera, AWS, Google"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>

          {/* Date & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date Issued
              </label>
              <input type="month" value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all"
                style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5" /> Display Order
              </label>
              <input type="number" min="0" value={form.order}
                onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                placeholder="0, 1, 2…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Certificate Image</label>
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/70 text-xs mb-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Auto-compressed & stored in Firestore (free). For large images, paste an Imgur URL.
            </div>
            <ImagePickerInline
              value={form.image}
              onChange={(v) => setForm(f => ({ ...f, image: v }))} />
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
              {saving ? "Saving…" : editCert ? "Update" : "Add Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Sortable wrapper ──────────────────────────────────────────────────
const SortableCertCard = ({ cert, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cert.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle */}
      <div
        {...attributes} {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <CertCard cert={cert} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

// ── Cert Card ─────────────────────────────────────────────────────────
const CertCard = ({ cert, onEdit, onDelete }) => {
  const formatDate = (d) => {
    if (!d) return null;
    const [year, month] = d.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-200">
      <div className="relative h-44 bg-gray-900/80 flex items-center justify-center overflow-hidden">
        {cert.image ? (
          <img src={cert.image} alt={cert.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Award className="w-12 h-12 text-gray-700" />
        )}
        {cert.order !== undefined && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#b91c1c]/60 text-white text-xs font-bold flex items-center justify-center border border-[#b91c1c]/40">
            {cert.order}
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-white text-sm line-clamp-2">{cert.name || "Untitled"}</h3>
        {cert.issuer && <p className="text-gray-400 text-xs">{cert.issuer}</p>}
        {cert.date && (
          <div className="flex items-center gap-1.5 text-xs text-red-300/80">
            <Calendar className="w-3 h-3" /> {formatDate(cert.date)}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={() => onEdit(cert)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(cert.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────
const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCert, setEditCert] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchCertificates = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "certificates"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setCertificates(data);
    } catch (err) {
      showToast("error", "Failed to load: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Save new order to Firestore after drag
  const persistOrder = async (ordered) => {
    setSaving(true);
    try {
      await Promise.all(
        ordered.map((cert, idx) =>
          updateDoc(doc(db, "certificates", cert.id), { order: idx })
        )
      );
      showToast("success", "Order saved!");
    } catch (err) {
      showToast("error", "Could not save order: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCertificates(prev => {
      const oldIdx = prev.findIndex(c => c.id === active.id);
      const newIdx = prev.findIndex(c => c.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      persistOrder(reordered);
      return reordered;
    });
  };

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const handleOpen = (c = null) => { setEditCert(c); setModalOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this certificate permanently?")) return;
    try {
      await deleteDoc(doc(db, "certificates", id));
      showToast("success", "Certificate deleted.");
      fetchCertificates();
    } catch (err) {
      showToast("error", "Delete failed: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 text-sm mt-1">
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} ·
            <span className="text-red-400 ml-1">drag to reorder</span>
            {saving && <span className="text-yellow-400 ml-2 animate-pulse">saving order…</span>}
          </p>
        </div>
        <button onClick={() => handleOpen()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
          <Plus className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-400 mr-3" /> Loading…
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
          <Award className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No certificates yet. Add your first one!</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={certificates.map(c => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {certificates.map(c => (
                <SortableCertCard key={c.id} cert={c} onEdit={handleOpen} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CertModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCert(null); }}
        onSaved={() => { fetchCertificates(); showToast("success", editCert ? "Updated!" : "Certificate added!"); }}
        editCert={editCert}
      />

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default Certificates;
