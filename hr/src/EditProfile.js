import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaUserEdit, FaSave } from "react-icons/fa";
import "./HomeUser.css";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    second_name: "",
    middle_name: "",
    password: "",
    national_id: "",
    marital_status: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user")); // Get full user object
  const userId = userData ? userData.id : null;
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.post(`https://newhrsys-production.up.railway.app/api/user-get/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.user;
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          second_name: userData.second_name || "",
          middle_name: userData.middle_name || "",
          national_id: userData.national_id || "",
          marital_status: userData.marital_status || "",
        });

        if (userData.image_path) {
          setPreview(`https://newhrsys-production.up.railway.app/storage/${userData.image_path}`);
        }
      } catch (error) {
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      }

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `https://newhrsys-production.up.railway.app/api/user/${userId}`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      if (response.data.message) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">Edit Profile</h1>
      </header>
      <main className="app-main-content">
        {error && <div className="app-alert error">{error}</div>}
        {success && <div className="app-alert success">{success}</div>}
        <div className="app-card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Profile Picture</label>
                <div className="image-upload">
                  <img src={preview || "/default-avatar.png"} alt="Profile" className="profile-preview" />
                  <label className="app-btn secondary">
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Second Name</label>
                <input type="text" value={formData.second_name} onChange={(e) => setFormData({ ...formData, second_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" value={formData.middle_name} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>National ID</label>
                <input type="text" value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}>
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <button type="submit" className="app-btn success" disabled={loading}>
                <FaSave /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <FaHome />
          <span>Home</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <FaUserEdit />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default EditProfile;
