import React, { useState, useEffect } from "react";
import api from "../main/api";
import { useNavigate } from "react-router-dom";

import Spinner from "../components/Spinner";
import Swal from "sweetalert2";  // استيراد SweetAlert2
import Sidebar from "../components/Sidebar";
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
      <Sidebar />

      <main className="app-main-content">
        {successMessage && <div className="app-alert success">{successMessage}</div>}
        {error && <div className="app-alert error">{error}</div>}

        <div className="app-container">


          <div className="app-card data-card">


            <div className="card-body">
              <h5 className="card-title">معلومات الموظف</h5>
              <div className="user-info">
                <p><strong>الرمز الوظيفي:</strong> <span>{userData.user_code}</span></p>
                <p><strong>تاريخ الميلاد:</strong> <span>{userData.date_of_birth}</span></p>
                <p><strong>نوع العمل:</strong> <span>{userData.work_type}</span></p>
                <p><strong>الإجازات السنوية:</strong> <span>{userData.annual_vacations_days} يوم</span></p>
                <p><strong>الإجازات المرضية:</strong> <span>{userData.sick_days} يوم</span></p>
                <p><strong>الراتب:</strong> <span>{userData.salary} دينار</span></p>
                <p><strong>الحضور من أي مكان:</strong> <span className={userData.attendtaby ? "active" : "inactive"}>
                  {userData.attendtaby ? "مفعل ✅" : "غير مفعل ❌"}
                </span></p>
                <p><strong>معلومات إضافية:</strong> <span>{userData.additional_information || "لا يوجد"}</span></p>
              </div>
            </div>
          </div>

        </div>
      </main>


    </div>
  );
};

export default UserProfile;
