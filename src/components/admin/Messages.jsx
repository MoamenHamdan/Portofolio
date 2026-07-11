import React, { useState, useEffect } from "react";
import { db, collection, getDocs, doc, deleteDoc, orderBy, query } from "../../firebase";
import {
    Mail, Trash2, Clock, User, MessageSquare, Loader2,
    CheckCircle, AlertCircle, X, Search, Inbox
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────
const Toast = ({ type, message, onDismiss }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
    ${type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
        {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="max-w-xs">{message}</span>
        <button onClick={onDismiss}><X className="w-4 h-4" /></button>
    </div>
);

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(data);
        } catch (err) {
            showToast("error", "Failed to load messages: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteDoc(doc(db, "messages", id));
            showToast("success", "Message deleted successfully.");
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            showToast("error", "Delete failed: " + err.message);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Just now";
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const filteredMessages = messages.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Inbox className="w-8 h-8 text-red-400" />
                        Messages
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {messages.length} message{messages.length !== 1 ? "s" : ""} received from contact form
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    <p className="animate-pulse">Loading messages...</p>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 bg-white/5 border border-white/10 rounded-3xl text-gray-500">
                    <Mail className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No messages found</p>
                    <p className="text-sm">When someone contacts you, their message will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                            <User className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{msg.name || "Anonymous"}</h3>
                                            <p className="text-sm text-red-400/80">{msg.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <MessageSquare className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-between items-end gap-4 min-w-[120px]">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(msg.timestamp)}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default Messages;
