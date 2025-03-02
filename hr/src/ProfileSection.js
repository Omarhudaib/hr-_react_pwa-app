import React, { useState, useEffect } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    second_name: "",
    middle_name: "",
    last_name: "",
    national_id: "",
    marital_status: "",
    password: "",
    password_confirmation: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");



 
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;
        const token = localStorage.getItem("authToken");
  
        console.log("User ID:", userId);
        console.log("Token:", token);
  
        if (!userId || !token) {
          setError("User ID or token not found.");
          return;
        }
  
        const response = await api.post(
          `/user-get/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        setUserData(response.data.user);
        setFormData({
          first_name: response.data.user.first_name || "",
          second_name: response.data.user.second_name || "",
          middle_name: response.data.user.middle_name || "",
          last_name: response.data.user.last_name || "",
          national_id: response.data.user.national_id || "",
          marital_status: response.data.user.marital_status || "",
          password: "",
          password_confirmation: "",
          image: null,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data.");
      }
    };
  
    fetchUserData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = JSON.parse(localStorage.getItem("user")).id;
      const token = localStorage.getItem("authToken");

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.post(
        `/user/${userId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("User data updated successfully!");
      setError("");
    } catch (err) {
      setError("Failed to update user data.");
      setSuccessMessage("");
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Profile</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Second Name:</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Middle Name:</label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>National ID:</label>
          <input
            type="text"
            name="national_id"
            value={formData.national_id}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Marital Status:</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Profile Image:</label>
          <input type="file" name="image" onChange={handleChange} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UserProfile;