import React, { useEffect, useState } from "react";
import axios from "axios";
import InstallButton from "./InstallButton";
import { FaHome, FaUserEdit, FaListAlt, FaSignInAlt, FaSignOutAlt, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import "./HomeUser.css";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Spinner from "./Spinner"; // A simple loading spinner component

const HomeUser = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkStatus, setCheckStatus] = useState(null);
  const [latitude, setLatitude] = useState(0); // Default latitude
  const [longitude, setLongitude] = useState(0); // Default longitude
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
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
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError("");
          setIsFetchingLocation(false);
        },
        () => {
          setError("فشل في الحصول على الموقع. يرجى إدخاله يدوياً.");
          setIsFetchingLocation(false);
        }
      );
    } else {
      setError("المتصفح لا يدعم تحديد الموقع.");
      setIsFetchingLocation(false);
    }
  };

  const handleManualLocation = () => {
    const manualLatitude = prompt("أدخل خط العرض:");
    const manualLongitude = prompt("أدخل خط الطول:");

    if (manualLatitude && manualLongitude) {
      setLatitude(parseFloat(manualLatitude));
      setLongitude(parseFloat(manualLongitude));
      setError("");
    } else {
      setError("يرجى إدخال قيم صحيحة لخط العرض وخط الطول.");
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "https://newhrsys-production.up.railway.app/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">مرحباً، {user?.first_name} {user?.last_name}</h1>
        <div className="header-controls">
          <InstallButton />
          <button className="app-btn icon-btn" onClick={handleLogout} title="تسجيل الخروج">
            <FaSignOutAlt />
          </button>
        </div>
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
            {isFetchingLocation ? (
              <div className="loading-container">
                <Spinner />
                <p>جارٍ تحديد الموقع...</p>
              </div>
            ) : latitude && longitude ? (
              <>
                <MapContainer
                  center={[latitude, longitude]}
              
                  style={{ height: "200px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[latitude, longitude]}>
                    <Popup>موقعك الحالي</Popup>
                  </Marker>
                </MapContainer>
                <p className="location-coordinates">
                  خط العرض: {latitude.toFixed(6)}، خط الطول: {longitude.toFixed(6)}
                </p>
              </>
            ) : (
              <p>لم يتم تحديد الموقع بعد.</p>
            )}
            <div className="location-buttons item ">
              <button className="app-btn secondary w-100 " onClick={getLocation}>
                تحديث الموقع
              </button>
            </div>
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
                {loading ? <Spinner /> : <FaSignInAlt />} تسجيل الدخول
              </button>
              <button
                className="app-btn warning"
                onClick={handleCheckOut}
                disabled={loading || checkStatus === "Checked Out"}
              >
                {loading ? <Spinner /> : <FaSignOutAlt />} تسجيل الخروج
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