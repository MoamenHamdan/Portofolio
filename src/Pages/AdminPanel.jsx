import React, { useState } from "react";
import { auth, signInWithEmailAndPassword, signOut } from "../firebase";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import Projects from "../components/admin/Projects";
import Certificates from "../components/admin/Certificates";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(auth.currentUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2 p-2 w-full border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-2 w-full border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="projects" />} />
          <Route path="projects" element={<Projects />} />
          <Route path="certificates" element={<Certificates />} />
        </Routes>
      </AdminLayout>
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
};

export default AdminPanel;
