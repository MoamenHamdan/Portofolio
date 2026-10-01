import { useState, useEffect } from "react";
import { db, doc, getDoc, setDoc } from "../../firebase";
import {
  Save, Plus, X, Shield, Loader2, CheckCircle, AlertCircle, BookOpen, Target, Info
} from "lucide-react";

// Firestore document: siteSettings/socCredibility
// Fields:
//   careerTransitionNote: string — the dev-to-SOC narrative paragraph
//   siemTools: string[]          — e.g. ["Splunk", "Elastic SIEM"]
//   incidentResponse: string[]   — e.g. ["Alert triage", "Log analysis"]
//   networkMonitoring: string[]  — e.g. ["Wireshark", "Nmap"]
//   ticketingSystems: string[]   — e.g. ["Jira", "ServiceNow"]
//   tryhackmeProfile: string     — URL to TryHackMe profile
//   tryhackmeRooms: number       — number of rooms completed
//   tryhackmeBadges: string[]    — badge names earned
//   otherPlatforms: string[]     — e.g. ["HackTheBox", "PicoCTF"]

const SETTINGS_DOC = (db) => doc(db, "siteSettings", "socCredibility");

const defaultData = {
  careerTransitionNote: "",
  siemTools: [],
  incidentResponse: [],
  networkMonitoring: [],
  ticketingSystems: [],
  tryhackmeProfile: "",
  tryhackmeRooms: 0,
  tryhackmeBadges: [],
  otherPlatforms: [],
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

// ── Section Card ──────────────────────────────────────────────────────
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

// ── Tag Input ─────────────────────────────────────────────────────────
const TagInput = ({ tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t && !tags.includes(t)) { onAdd(t); setInput(""); } };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
        <button type="button" onClick={add}
          className="px-4 py-2.5 rounded-xl bg-[#b91c1c]/20 hover:bg-[#b91c1c]/30 border border-[#b91c1c]/30 text-red-300 text-sm font-medium transition-all flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-300 text-sm border border-white/10">
            {tag}
            <button type="button" onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────
const SOCCredibility = () => {
  const [data, setData] = useState(defaultData);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(SETTINGS_DOC(db));
        if (snap.exists()) setData({ ...defaultData, ...snap.data() });
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
      await setDoc(SETTINGS_DOC(db), data, { merge: true });
      showToast("success", "SOC credibility info saved!");
    } catch (err) {
      showToast("error", "Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addToArray = (key, value) => setData(d => ({ ...d, [key]: [...d[key], value] }));
  const removeFromArray = (key, idx) => setData(d => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin text-red-400 mr-3" />
        <span className="text-sm">Loading SOC settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" /> SOC Credibility
          </h1>
          <p className="text-gray-400 text-sm mt-1">Security skills, platforms &amp; career transition narrative</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#ef4444] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Career Transition Note */}
      <SectionCard icon={BookOpen} title="Career Transition Narrative"
        subtitle="A recruiter-ready paragraph explaining your dev-to-SOC pivot. This answers the most common interview question before it's even asked.">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-300/80 text-xs">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Keep this authentic. Explain WHY you're making the transition, not just that you are. Mention your dev background as an asset for SOC work (understanding attacker TTPs, code review, scripting).
        </div>
        <textarea rows={6} value={data.careerTransitionNote}
          onChange={(e) => setData(d => ({ ...d, careerTransitionNote: e.target.value }))}
          placeholder="e.g. After 3 years of backend development with C# and .NET, I discovered my passion for cybersecurity through CTF competitions and TryHackMe. My development background gives me a unique perspective in a SOC — I understand how applications are built, which makes me more effective at identifying vulnerabilities and analyzing attack patterns..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all resize-none leading-relaxed" />
        <p className="text-right text-xs text-gray-500">{data.careerTransitionNote.length} chars</p>
      </SectionCard>

      {/* TryHackMe */}
      <SectionCard icon={Target} title="TryHackMe / Learning Platforms"
        subtitle="Verified learning progress shown on the public portfolio">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">TryHackMe Profile URL</label>
            <input type="url" value={data.tryhackmeProfile}
              onChange={(e) => setData(d => ({ ...d, tryhackmeProfile: e.target.value }))}
              placeholder="https://tryhackme.com/p/yourusername"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Rooms Completed</label>
            <input type="number" min="0" value={data.tryhackmeRooms}
              onChange={(e) => setData(d => ({ ...d, tryhackmeRooms: Number(e.target.value) }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#b91c1c]/50 transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Badges Earned</label>
          <TagInput
            tags={data.tryhackmeBadges}
            onAdd={(v) => addToArray("tryhackmeBadges", v)}
            onRemove={(i) => removeFromArray("tryhackmeBadges", i)}
            placeholder="e.g. Pre-Security, SOC Level 1, Jr Penetration Tester" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Other Platforms</label>
          <TagInput
            tags={data.otherPlatforms}
            onAdd={(v) => addToArray("otherPlatforms", v)}
            onRemove={(i) => removeFromArray("otherPlatforms", i)}
            placeholder="e.g. HackTheBox, PicoCTF, CyberDefenders" />
        </div>
      </SectionCard>

      {/* SOC Skills */}
      <SectionCard icon={Shield} title="SOC Security Skills"
        subtitle="Only add skills you genuinely have — these will be shown on your portfolio">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SIEM Tools</label>
            <TagInput
              tags={data.siemTools}
              onAdd={(v) => addToArray("siemTools", v)}
              onRemove={(i) => removeFromArray("siemTools", i)}
              placeholder="e.g. Splunk, Elastic SIEM, Microsoft Sentinel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Incident Response / Log Analysis</label>
            <TagInput
              tags={data.incidentResponse}
              onAdd={(v) => addToArray("incidentResponse", v)}
              onRemove={(i) => removeFromArray("incidentResponse", i)}
              placeholder="e.g. Alert triage, Log analysis, MITRE ATT&CK" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Network Monitoring</label>
            <TagInput
              tags={data.networkMonitoring}
              onAdd={(v) => addToArray("networkMonitoring", v)}
              onRemove={(i) => removeFromArray("networkMonitoring", i)}
              placeholder="e.g. Wireshark, Nmap, tcpdump" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ticketing / ITSM Systems</label>
            <TagInput
              tags={data.ticketingSystems}
              onAdd={(v) => addToArray("ticketingSystems", v)}
              onRemove={(i) => removeFromArray("ticketingSystems", i)}
              placeholder="e.g. Jira, ServiceNow, TheHive" />
          </div>
        </div>
      </SectionCard>

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

export default SOCCredibility;
