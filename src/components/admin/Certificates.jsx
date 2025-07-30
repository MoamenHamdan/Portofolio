import React, { useState, useEffect } from "react";
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useForm from "../../hooks/useForm";
import Modal from "../Modal";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCertId, setEditCertId] = useState(null);
  const [certImgFile, setCertImgFile] = useState(null);
  const { values, handleChange, setValues, resetForm } = useForm({
    name: "",
    image: "",
  });

  const fetchData = async () => {
    try {
      const certSnap = await getDocs(collection(db, "certificates"));
      setCertificates(certSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    let imgUrl = values.image;
    try {
      if (certImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `certificates/${Date.now()}_${certImgFile.name}`);
        await uploadBytes(imgRef, certImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await addDoc(collection(db, "certificates"), { ...values, image: imgUrl });
      resetForm();
      setCertImgFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error adding certificate: " + err.message);
    }
  };

  const handleEditCert = (cert) => {
    setEditCertId(cert.id);
    setValues(cert);
    setIsModalOpen(true);
  };

  const handleUpdateCert = async (e) => {
    e.preventDefault();
    let imgUrl = values.image;
    try {
      if (certImgFile) {
        const storage = getStorage();
        const imgRef = ref(storage, `certificates/${Date.now()}_${certImgFile.name}`);
        await uploadBytes(imgRef, certImgFile);
        imgUrl = await getDownloadURL(imgRef);
      }
      await updateDoc(doc(db, "certificates", editCertId), { ...values, image: imgUrl });
      setEditCertId(null);
      resetForm();
      setCertImgFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Error updating certificate: " + err.message);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        await deleteDoc(doc(db, "certificates", id));
        fetchData();
      } catch (err) {
        alert("Error deleting certificate: " + err.message);
      }
    }
  };

  const openModal = () => {
    setEditCertId(null);
    resetForm();
    setCertImgFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Certificates</h1>
        <button onClick={openModal} className="bg-green-500 text-white px-4 py-2 rounded">
          Add Certificate
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={cert.image} alt={cert.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{cert.name}</h2>
              <div className="flex justify-end">
                <button
                  onClick={() => handleEditCert(cert)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCertificate(cert.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4">{editCertId ? "Edit Certificate" : "Add Certificate"}</h2>
        <form onSubmit={editCertId ? handleUpdateCert : handleAddCertificate}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={values.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCertImgFile(e.target.files[0])}
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
              {editCertId ? "Update Certificate" : "Add Certificate"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Certificates;
