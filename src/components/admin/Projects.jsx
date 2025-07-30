import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useForm from "../../hooks/useForm";
import Modal from "../Modal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectImgFile, setProjectImgFile] = useState(null);
  const { values, handleChange, setValues, resetForm } = useForm({
    title: "",
    description: "",
    features: "",
    github: "",
    imgLink: "",
    techStack: [],
  });
  const [tech, setTech] = useState("");

  const fetchData = async () => {
    try {
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    let imgUrl = values.imgLink;
    try {
      if (projectImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `projects/${Date.now()}_${projectImgFile.name}`);
        await uploadBytes(imgRef, projectImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await addDoc(collection(db, "projects"), { ...values, imgLink: imgUrl });
      resetForm();
      setProjectImgFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error adding project: " + err.message);
    }
  };

  const handleEditProject = (project) => {
    setEditProjectId(project.id);
    setValues(project);
    setIsModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    let imgUrl = values.imgLink;
    try {
      if (projectImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `projects/${Date.now()}_${projectImgFile.name}`);
        await uploadBytes(imgRef, projectImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await updateDoc(doc(db, "projects", editProjectId), { ...values, imgLink: imgUrl });
      setEditProjectId(null);
      resetForm();
      setProjectImgFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", id));
        fetchData();
      } catch (err) {
        alert("Error deleting project: " + err.message);
      }
    }
  };

  const openModal = () => {
    setEditProjectId(null);
    resetForm();
    setProjectImgFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddTech = () => {
    if (tech) {
      setValues({
        ...values,
        techStack: [...(values.techStack || []), tech],
      });
      setTech("");
    }
  };

  const handleRemoveTech = (index) => {
    setValues({
      ...values,
      techStack: values.techStack.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button onClick={openModal} className="bg-green-500 text-white px-4 py-2 rounded">
          Add Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={project.imgLink} alt={project.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-700 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.isArray(project.techStack) &&
                  project.techStack.map((tech, idx) => (
                    <span key={idx} className="bg-gray-200 px-2 py-1 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
              </div>
              <div className="flex justify-between">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  GitHub
                </a>
                <div>
                  <button
                    onClick={() => handleEditProject(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4">{editProjectId ? "Edit Project" : "Add Project"}</h2>
        <form onSubmit={editProjectId ? handleUpdateProject : handleAddProject}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={values.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Description"
              value={values.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Features</label>
            <input
              type="text"
              name="features"
              placeholder="Features"
              value={values.features}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">GitHub URL</label>
            <input
              type="text"
              name="github"
              placeholder="Github"
              value={values.github}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tech"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="p-2 border rounded w-full"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(values.techStack || []).map((tech, idx) => (
                <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tech}
                  <button
                    type="button"
                    className="ml-1 text-red-500"
                    onClick={() => handleRemoveTech(idx)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProjectImgFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {editProjectId ? "Update Project" : "Add Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
