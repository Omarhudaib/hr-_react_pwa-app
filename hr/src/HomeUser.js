import React, { useEffect, useState } from "react";
import api from "./api";
import InstallButton from "./InstallButton";
import { FaHome, FaUserEdit, FaListAlt, FaSignInAlt, FaSignOutAlt, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import "./HomeUser.css";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Spinner from "./Spinner"; // A simple loading spinner component
import Swal from "sweetalert2";
import L from "leaflet";

const locationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41]
});

const HomeUser = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success] = useState("");
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
    getLocation();
  }, [navigate]);

  const fetchCheckStatus = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(
        `/user-checkStatus/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isCheckedIn, isCheckedOut } = response.data;

      // تعديل الحالة لتكون باللغة العربية
      if (isCheckedIn) {
        setCheckStatus("مسجل دخول");
      } else if (isCheckedOut) {
        setCheckStatus("مسجل خروج");
      } else {
        setCheckStatus("غير مسجل");
      }
    } catch (err) {
      setCheckStatus("غير معروف"); // تأكد من تعيين حالة افتراضية هنا باللغة العربية
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

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // Ensure location is fetched before proceeding
      if (!latitude || !longitude) {
        await getLocation();
        if (!latitude || !longitude) {
          throw new Error("فشل في الحصول على الموقع. يرجى المحاولة مرة أخرى.");
        }
      }

      const token = localStorage.getItem("authToken");
      const response = await api.post(`/user-checkIn/${user.id}`, {
        user_id: user.id,
        company_id: user.company_id,
        latitude_in: latitude,
        longitude_in: longitude,
      }, { headers: { Authorization: `Bearer ${token}` } });

      Swal.fire("تم بنجاح", "تم تسجيل الدخول بنجاح!", "success");
      setCheckStatus("مسجل دخول");
    } catch (err) {
      let errorMessage = "فشل تسجيل الدخول.";
      if (err.response) {
        const { error, distance_difference } = err.response.data;
        switch (error) {
          case "Invalid location format":
            errorMessage = "تنسيق الموقع غير صالح. يرجى التأكد من تشغيل GPS وإعادة المحاولة.";
            break;
          case "Location too far":
            errorMessage = `أنت بعيد عن موقع القسم بمسافة ${(distance_difference * 1000).toFixed(2)} متر. يرجى الاقتراب أكثر.`;
            break;
          case "You have already checked in today without checking out":
            errorMessage = "لقد قمت بتسجيل الدخول بالفعل اليوم بدون تسجيل الخروج.";
            break;
          case "User not found":
            errorMessage = "المستخدم غير موجود.";
            break;
          default:
            errorMessage = error || "حدث خطأ غير معروف.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      Swal.fire("خطأ", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // Ensure location is fetched before proceeding
      if (!latitude || !longitude) {
        await getLocation();
        if (!latitude || !longitude) {
          throw new Error("فشل في الحصول على الموقع. يرجى المحاولة مرة أخرى.");
        }
      }

      const token = localStorage.getItem("authToken");
      const response = await api.post(`/user-checkOut/${user.id}`, {
        user_id: user.id,
        company_id: user.company_id,
        latitude_out: latitude,
        longitude_out: longitude,
      }, { headers: { Authorization: `Bearer ${token}` } });

      Swal.fire("تم بنجاح", "تم تسجيل الخروج بنجاح!", "success");
      setCheckStatus("مسجل خروج");
    } catch (err) {
      let errorMessage = "فشل تسجيل الخروج.";
      if (err.response) {
        const { error, distance_difference } = err.response.data;
        switch (error) {
          case "Invalid location format":
            errorMessage = "تنسيق الموقع غير صالح. يرجى التأكد من تشغيل GPS وإعادة المحاولة.";
            break;
          case "Location too far":
            errorMessage = `أنت بعيد عن موقع القسم بمسافة ${(distance_difference * 1000).toFixed(2)} متر. يرجى الاقتراب أكثر.`;
            break;
          case "No check-in record found":
            errorMessage = "لم يتم العثور على سجل تسجيل الدخول. يرجى تسجيل الدخول أولاً.";
            break;
          case "You have already checked out":
            errorMessage = "لقد قمت بالفعل بتسجيل الخروج.";
            break;
          case "User not found":
            errorMessage = "المستخدم غير موجود.";
            break;
          default:
            errorMessage = error || "حدث خطأ غير معروف.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      Swal.fire("خطأ", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await api.post("/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      Swal.fire({
        title: "تم تسجيل الخروج",
        text: "تم تسجيل خروجك بنجاح!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => navigate("/"));
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
                  zoom={13}
                  style={{ height: "200px", width: "100%" }}
                >
                  <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[latitude, longitude]} icon={locationIcon}>
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
                disabled={loading || checkStatus === "مسجل دخول"}
              >
                {loading ? <Spinner /> : <FaSignInAlt />} تسجيل الدخول
              </button>
              <button
                className="app-btn warning"
                onClick={handleCheckOut}
                disabled={loading || checkStatus === "مسجل خروج"}
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