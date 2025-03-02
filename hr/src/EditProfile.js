import React, { useState, useEffect } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import { FaUserEdit, FaSave, FaFileImage } from "react-icons/fa";
import Spinner from "./Spinner";
import Swal from "sweetalert2";  // استيراد SweetAlert2

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("authToken");

        if (!user?.id || !token) {
          setError("Authentication required");
          navigate('/login');
          return;
        }

        const response = await api.get(
          `/user-get/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserData(response.data);
        setFormData({
          first_name: response.data.first_name || "",
          second_name: response.data.second_name || "",
          middle_name: response.data.middle_name || "",
          last_name: response.data.last_name || "",
          national_id: response.data.national_id || "",
          marital_status: response.data.marital_status || "",
          password: "",
          password_confirmation: "",
          image: null,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.error || "Failed to fetch user data.");
        if (err.response?.status === 401) navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

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
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("authToken");
  
      if (!user?.id || !token) {
        setError("Authentication required");
        navigate('/login');
        return;
      }
  
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key] || ""); // Ensure all fields are sent
      });
  
      const response = await api.post(
        `/user/${user.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Include the token
          },
        }
      );
  
      setSuccessMessage("User data updated successfully!");
      setError("");

      // عرض تنبيه بنجاح التحديث
      Swal.fire({
        title: 'تم التحديث!',
        text: 'تم تحديث بيانات المستخدم بنجاح.',
        icon: 'success',
        confirmButtonText: 'موافق'
      });

    } catch (err) {
      console.error("Error updating user data:", err);
      setError(err.response?.data?.message || "Failed to update user data.");
      setSuccessMessage("");

      // عرض تنبيه عند حدوث خطأ
      Swal.fire({
        title: 'حدث خطأ!',
        text: err.response?.data?.message || "فشل في تحديث البيانات.",
        icon: 'error',
        confirmButtonText: 'موافق'
      });
    }
  };

  if (!userData) {
    return (
      <div style={{ padding: "25%" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">مرحباً، {formData.first_name}</h1>
      </header>
      <main className="app-main-content">
        {successMessage && <div className="app-alert success">{successMessage}</div>}
        {error && <div className="app-alert error">{error}</div>}

        <div className="app-container">
          <div className="app-card form-card">
            <div className="card-header">
              <FaUserEdit className="card-icon" />
              <h3>تحديث الملف الشخصي</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>الاسم الأول:</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>اسم الأب:</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>اسم العائلة:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>الحالة الاجتماعية:</label>
                  <select
                    name="marital_status"
                    value={formData.marital_status || ""}
                    onChange={handleChange}
                  >
                    <option value="">اختر</option>
                    <option value="single">أعزب</option>
                    <option value="married">متزوج</option>
                    <option value="divorced">مطلق</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>صورة الملف الشخصي:</label>
                  <input type="file" name="image" onChange={handleChange} />
                </div>

                <button type="submit" className="app-btn success">
                  <FaSave /> حفظ التغييرات
                </button>
              </form>
            </div>
          </div>

          <div className="app-card data-card">
            <div className="card-header">
              <h3>بيانات المستخدم</h3>
            </div>
            <div className="card-body user-data">
              <p><strong>الرمز الوظيفي:</strong> {userData.user_code}</p>
              <p><strong>تاريخ الميلاد:</strong> {userData.date_of_birth}</p>
              <p><strong>نوع العمل:</strong> {userData.work_type}</p>
              <p><strong>الإجازات السنوية:</strong> {userData.annual_vacations_days} يوم</p>
              <p><strong>الإجازات المرضية:</strong> {userData.sick_days} يوم</p>
              <p><strong>الراتب:</strong> {userData.salary} ريال</p>
              <p><strong>الحضور من اي مكان :</strong> {userData.attendtaby ? "مفعل" : "غير مفعل"}</p>
              <p><strong>معلومات إضافية:</strong> {userData.additional_information}</p>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <FaUserEdit />
          <span>الرئيسية</span>
        </Link>
        <Link to="/edit-profile" className="nav-item">
          <FaUserEdit />
          <span>تعديل الملف</span>
        </Link>
        <Link to="/my-requests" className="nav-item">
          <FaFileImage />
          <span>طلباتي</span>
        </Link>
      </nav>
    </div>
  );
};

export default UserProfile;
