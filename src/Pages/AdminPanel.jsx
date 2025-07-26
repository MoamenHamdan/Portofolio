import React, { useState, useEffect } from "react";
import { auth, signInWithEmailAndPassword, signOut, db, collection, addDoc } from "../firebase";
import { doc, setDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    features: "",
    github: "",
    imgLink: "",
    techStack: []
  });
  const [newTech, setNewTech] = useState("");
  const [newCertificate, setNewCertificate] = useState({ name: "", image: "" });
  const [editProjectId, setEditProjectId] = useState(null);
  const [editProject, setEditProject] = useState({});
  const [editTech, setEditTech] = useState("");
  const [editCertId, setEditCertId] = useState(null);
  const [editCert, setEditCert] = useState({});
  const [projectImgFile, setProjectImgFile] = useState(null);
  const [certImgFile, setCertImgFile] = useState(null);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Fetch projects and certificates
  const fetchData = async () => {
    try {
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const certSnap = await getDocs(collection(db, "certificates"));
      setCertificates(certSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Fetch data on login and when user is set
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setProjects([]);
      setCertificates([]);
    }
  }, [user]);

  // Add new project with image upload
  const handleAddProject = async (e) => {
    e.preventDefault();
    let imgUrl = newProject.imgLink;
    try {
      if (projectImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `projects/${Date.now()}_${projectImgFile.name}`);
        await uploadBytes(imgRef, projectImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await addDoc(collection(db, "projects"), { ...newProject, imgLink: imgUrl });
      setNewProject({ title: "", description: "", features: "", github: "", imgLink: "", techStack: "" });
      setProjectImgFile(null);
      fetchData();
    } catch (err) {
      alert("Error adding project: " + err.message);
    }
  };

  // Add new certificate with image upload
  const handleAddCertificate = async (e) => {
    e.preventDefault();
    let imgUrl = newCertificate.image;
    try {
      if (certImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `certificates/${Date.now()}_${certImgFile.name}`);
        await uploadBytes(imgRef, certImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await addDoc(collection(db, "certificates"), { ...newCertificate, image: imgUrl });
      setNewCertificate({ name: "", image: "" });
      setCertImgFile(null);
      fetchData();
    } catch (err) {
      alert("Error adding certificate: " + err.message);
    }
  };
  // Edit project
  const handleEditProject = (project) => {
    setEditProjectId(project.id);
    setEditProject({ ...project });
  };
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    let imgUrl = editProject.imgLink;
    try {
      if (projectImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `projects/${Date.now()}_${projectImgFile.name}`);
        await uploadBytes(imgRef, projectImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await updateDoc(doc(db, "projects", editProjectId), { ...editProject, imgLink: imgUrl });
      setEditProjectId(null);
      setEditProject({});
      setProjectImgFile(null);
      fetchData();
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  };
  // Edit certificate
  const handleEditCert = (cert) => {
    setEditCertId(cert.id);
    setEditCert({ ...cert });
  };
  const handleUpdateCert = async (e) => {
    e.preventDefault();
    let imgUrl = editCert.image;
    try {
      if (certImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `certificates/${Date.now()}_${certImgFile.name}`);
        await uploadBytes(imgRef, certImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await updateDoc(doc(db, "certificates", editCertId), { ...editCert, image: imgUrl });
      setEditCertId(null);
      setEditCert({});
      setCertImgFile(null);
      fetchData();
    } catch (err) {
      alert("Error updating certificate: " + err.message);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      fetchData();
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  };

  // Delete certificate
  const handleDeleteCertificate = async (id) => {
    try {
      await deleteDoc(doc(db, "certificates", id));
      fetchData();
    } catch (err) {
      alert("Error deleting certificate: " + err.message);
    }
  };

  // UI
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2 p-2 w-full border rounded" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 p-2 w-full border rounded" required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Projects Section */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {/* Add/Edit Project Form */}
          {editProjectId ? (
            <form onSubmit={handleUpdateProject} className="mb-4">
              <input type="text" placeholder="Title" value={editProject.title || ""} onChange={e => setEditProject({ ...editProject, title: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Description" value={editProject.description || ""} onChange={e => setEditProject({ ...editProject, description: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Features" value={editProject.features || ""} onChange={e => setEditProject({ ...editProject, features: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="text" placeholder="Github" value={editProject.github || ""} onChange={e => setEditProject({ ...editProject, github: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              {/* Tech Stack Array UI */}
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Add tech" value={editTech} onChange={e => setEditTech(e.target.value)} className="p-2 border rounded w-full" />
                  <button type="button" onClick={() => {
                    if (editTech) {
                      setEditProject({ ...editProject, techStack: [...(editProject.techStack || []), editTech] });
                      setEditTech("");
                    }
                  }} className="bg-green-500 text-white px-2 py-1 rounded">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editProject.techStack || []).map((tech, idx) => (
                    <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {tech}
                      <button type="button" className="ml-1 text-red-500" onClick={() => {
                        setEditProject({ ...editProject, techStack: editProject.techStack.filter((_, i) => i !== idx) });
                      }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Image Link" value={editProject.imgLink || ""} onChange={e => setEditProject({ ...editProject, imgLink: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="file" accept="image/*" onChange={e => setProjectImgFile(e.target.files[0])} className="mb-2 p-2 w-full border rounded" />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Update Project</button>
              <button type="button" onClick={() => { setEditProjectId(null); setEditProject({}); setProjectImgFile(null); setEditTech(""); }} className="bg-gray-400 text-white px-4 py-2 rounded w-full mt-2">Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleAddProject} className="mb-4">
              <input type="text" placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Features" value={newProject.features} onChange={e => setNewProject({ ...newProject, features: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="text" placeholder="Github" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              {/* Tech Stack Array UI */}
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Add tech" value={newTech} onChange={e => setNewTech(e.target.value)} className="p-2 border rounded w-full" />
                  <button type="button" onClick={() => {
                    if (newTech) {
                      setNewProject({ ...newProject, techStack: [...newProject.techStack, newTech] });
                      setNewTech("");
                    }
                  }} className="bg-green-500 text-white px-2 py-1 rounded">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newProject.techStack.map((tech, idx) => (
                    <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {tech}
                      <button type="button" className="ml-1 text-red-500" onClick={() => {
                        setNewProject({ ...newProject, techStack: newProject.techStack.filter((_, i) => i !== idx) });
                      }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Image Link" value={newProject.imgLink} onChange={e => setNewProject({ ...newProject, imgLink: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="file" accept="image/*" onChange={e => setProjectImgFile(e.target.files[0])} className="mb-2 p-2 w-full border rounded" />
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">Add Project</button>
            </form>
          )}
          {/* Display Projects */}
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Features</th>
                  <th className="p-2 border">Github</th>
                  <th className="p-2 border">Tech Stack</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} className="border">
                    <td className="p-2 border">{project.title}</td>
                    <td className="p-2 border">{project.description}</td>
                    <td className="p-2 border">{project.features}</td>
                    <td className="p-2 border"><a href={project.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Github</a></td>
                    <td className="p-2 border">
                      {Array.isArray(project.techStack)
                        ? project.techStack.map((tech, idx) => (
                            <span key={idx} className="bg-gray-100 px-2 py-1 rounded mr-1 text-xs">{tech}</span>
                          ))
                        : project.techStack}
                    </td>
                    <td className="p-2 border">{project.imgLink && <img src={project.imgLink} alt="Project" className="h-16 w-16 object-cover" />}</td>
                    <td className="p-2 border">
                      <button onClick={() => handleEditProject(project)} className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleDeleteProject(project.id)} className="bg-red-400 text-white px-2 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Certificates Section */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Certificates</h2>
          {/* Add/Edit Certificate Form */}
          {editCertId ? (
            <form onSubmit={handleUpdateCert} className="mb-4">
              <input type="text" placeholder="Name" value={editCert.name || ""} onChange={e => setEditCert({ ...editCert, name: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Image URL" value={editCert.image || ""} onChange={e => setEditCert({ ...editCert, image: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="file" accept="image/*" onChange={e => setCertImgFile(e.target.files[0])} className="mb-2 p-2 w-full border rounded" />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Update Certificate</button>
              <button type="button" onClick={() => { setEditCertId(null); setEditCert({}); setCertImgFile(null); }} className="bg-gray-400 text-white px-4 py-2 rounded w-full mt-2">Cancel</button>
            </form>
          ) : (
            <form onSubmit={handleAddCertificate} className="mb-4">
              <input type="text" placeholder="Name" value={newCertificate.name} onChange={e => setNewCertificate({ ...newCertificate, name: e.target.value })} className="mb-2 p-2 w-full border rounded" required />
              <input type="text" placeholder="Image URL" value={newCertificate.image} onChange={e => setNewCertificate({ ...newCertificate, image: e.target.value })} className="mb-2 p-2 w-full border rounded" />
              <input type="file" accept="image/*" onChange={e => setCertImgFile(e.target.files[0])} className="mb-2 p-2 w-full border rounded" />
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">Add Certificate</button>
            </form>
          )}
          {/* Display Certificates */}
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(cert => (
                  <tr key={cert.id} className="border">
                    <td className="p-2 border">{cert.name}</td>
                    <td className="p-2 border">{cert.image && <img src={cert.image} alt={cert.name} className="h-16 w-16 object-cover" />}</td>
                    <td className="p-2 border">
                      <button onClick={() => handleEditCert(cert)} className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleDeleteCertificate(cert.id)} className="bg-red-400 text-white px-2 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
