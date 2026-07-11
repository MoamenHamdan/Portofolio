import React, { useState, useEffect } from "react";
import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "../firebase";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import Projects from "../components/admin/Projects";
import Certificates from "../components/admin/Certificates";
import HomeContent from "../components/admin/HomeContent";
import Testimonials from "../components/admin/Testimonials";
import Skills from "../components/admin/Skills";
import Messages from "../components/admin/Messages";
import BlogPosts from "../components/admin/BlogPosts";
import SOCCredibility from "../components/admin/SOCCredibility";
import SocialLinksManager from "../components/admin/SocialLinksManager";
import Dashboard from "../components/admin/Dashboard";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

const ADMIN_SESSION_KEY = "admin_session_start";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce 24-hour hard expiry
        const sessionStart = localStorage.getItem(ADMIN_SESSION_KEY);
        if (sessionStart && Date.now() - parseInt(sessionStart, 10) > SESSION_TTL_MS) {
          // Session expired — force sign out
          await signOut(auth);
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Record session start time for 24-hour expiry enforcement
      localStorage.setItem(ADMIN_SESSION_KEY, Date.now().toString());
    } catch (err) {
      const messages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-email": "Invalid email address format.",
        "auth/too-many-requests": "Too many failed attempts. Please wait before trying again.",
        "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
      };
      setError(messages[err.code] || "Login failed: " + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#b91c1c]/30 border-t-[#b91c1c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen bg-[#030014] flex items-center justify-center px-4 font-['Poppins',sans-serif] relative overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b91c1c] to-[#ef4444] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to manage your portfolio</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#b91c1c]/50 focus:bg-white/8 transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#b91c1c]/50 focus:bg-white/8 transition-all duration-200 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full relative py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">
                  {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500">
                Secure admin access — unauthorized entry is prohibited
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={handleLogout} />}>
        <Route index element={<Dashboard />} />
        <Route path="home-content" element={<HomeContent />} />
        <Route path="projects" element={<Projects />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="skills" element={<Skills />} />
        <Route path="messages" element={<Messages />} />
        <Route path="blog-posts" element={<BlogPosts />} />
        <Route path="soc-credibility" element={<SOCCredibility />} />
        <Route path="social-links" element={<SocialLinksManager />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>
    </Routes>
  );
};

export default AdminPanel;
