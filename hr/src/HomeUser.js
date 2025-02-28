import React, { useEffect, useState } from "react";
import axios from "axios";
import InstallButton from "./InstallButton";
import { FaHome, FaUserEdit, FaListAlt, FaSignInAlt, FaSignOutAlt, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import "./HomeUser.css";
import { useNavigate, Link } from "react-router-dom";

const HomeUser = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkStatus, setCheckStatus] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      fetchCheckStatus(userData.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCheckStatus = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `https://newhrsys-production.up.railway.app/api/user-checkStatus/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCheckStatus(response.data.status);
    } catch (err) {
      setError("فشل في جلب حالة الدخول.");
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError("");
        },
        () => {
          setError("فشل في الحصول على الموقع. يرجى إدخاله يدوياً.");
        }
      );
    } else {
      setError("المتصفح لا يدعم تحديد الموقع.");
    }
  };

  const handleCheckIn = async () => {
    if (!user) return setError("بيانات المستخدم غير موجودة.");
    if (!latitude || !longitude) return setError("يرجى إدخال الموقع.");

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `https://newhrsys-production.up.railway.app/api/user-checkIn/${user.id}`,
        {
          user_id: user.id,
          company_id: user.company_id,
          latitude_in: latitude,
          longitude_in: longitude,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("تم تسجيل الدخول بنجاح!");
      setCheckStatus("Checked In");
    } catch (err) {
      setError("فشل تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return setError("بيانات المستخدم غير موجودة.");
    if (!latitude || !longitude) return setError("يرجى إدخال الموقع.");

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `https://newhrsys-production.up.railway.app/api/user-checkOut/${user.id}`,
        {
          user_id: user.id,
          company_id: user.company_id,
          latitude_out: latitude,
          longitude_out: longitude,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("تم تسجيل الخروج بنجاح!");
      setCheckStatus("Checked Out");
    } catch (err) {
      setError("فشل تسجيل الخروج.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">مرحباً، {user?.name}</h1>
        <InstallButton />
      </header>

      <main className="app-main-content">
        {success && <div className="app-alert success">{success}</div>}
        {error && <div className="app-alert error">{error}</div>}

        <div className="app-card">
          <div className="card-header">
            <FaMapMarkerAlt className="card-icon" />
            <h3>موقعك الحالي</h3>
          </div>
          <div className="card-body">
            <div className="location-info">
              <p>خط العرض: {latitude || "غير متوفر"}</p>
              <p>خط الطول: {longitude || "غير متوفر"}</p>
            </div>
            <button className="app-btn secondary" onClick={getLocation}>
              تحديث الموقع
            </button>
          </div>
        </div>

        <div className="app-card">
          <div className="card-header">
            <FaSignInAlt className="card-icon" />
            <h3>تسجيل الدخول/الخروج</h3>
          </div>
          <div className="card-body">
            <div className="check-buttons">
              <button 
                className="app-btn success" 
                onClick={handleCheckIn}
                disabled={loading || checkStatus === "Checked In"}
              >
                <FaSignInAlt /> تسجيل الدخول
              </button>
              <button
                className="app-btn warning"
                onClick={handleCheckOut}
                disabled={loading || checkStatus === "Checked Out"}
              >
                <FaSignOutAlt /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <FaHome />
          <span>الرئيسية</span>
        </Link>
        <Link to="/edit-profile" className="nav-item">
          <FaUserEdit />
          <span>الملف الشخصي</span>
        </Link>
        <Link to="/my-requests" className="nav-item">
          <FaListAlt />
          <span>طلباتي</span>
        </Link>
        <Link to="/add-request" className="nav-item">
          <FaFileAlt />
          <span>طلب جديد</span>
        </Link>
      </nav>
    </div>
  );
};

export default HomeUser;