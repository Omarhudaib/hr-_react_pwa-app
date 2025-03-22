import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// استيراد أيقونات جديدة من react-icons/fa
import {
  FaHome, // أيقونة المنزل
  FaUserCircle, // أيقونة الملف الشخصي
  FaClipboardList, // أيقونة القائمة (طلباتي)
  FaPlusSquare, // أيقونة الإضافة (طلب جديد)
  FaUsers, // أيقونة الموظفين
  FaUserPlus, // أيقونة إضافة مستخدم
  FaStar, // أيقونة التقييم
  FaSignOutAlt, // أيقونة تسجيل الخروج
  FaBars, // أيقونة فتح القائمة
  FaTimes, // أيقونة إغلاق القائمة
} from "react-icons/fa";
import "../css/Sidebar.css"; // استيراد ملف CSS
import api from "../main/api";
import Swal from "sweetalert2";

const user = JSON.parse(localStorage.getItem("user")); // Get user data
const departmentId = user?.department_id; // Ensure it's defined
const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // التحكم في القائمة الجانبية

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
    <div className="navbar-container">
      <nav className="navbar">
        <div className="nav-container">
          {/* زر القائمة الجانبية */}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* الروابط الرئيسية */}
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaHome className="icon" /> <span>الرئيسية</span>
            </Link>
            <Link to="/edit-profile" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaUserCircle className="icon" /> <span>الملف الشخصي</span>
            </Link>
            <Link to="/my-requests" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaClipboardList className="icon" /> <span>طلباتي</span>
            </Link>
            <Link to="/add-request" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaPlusSquare className="icon" /> <span>طلب جديد</span>
            </Link>

            {permissions.includes("View_User") && (
              <Link to="/Users" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FaUsers className="icon" /> <span>الموظفون</span>
              </Link>
            )}

            {permissions.includes("Add_User") && (
              <Link to="/user/users/create" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FaUserPlus className="icon" /> <span>إضافة مستخدم</span>
              </Link>
            )}

            {permissions.includes("Add_User") && departmentId && (
              <Link
                to={`/evaluate/${departmentId}`} // ✅ Use retrieved department ID
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                <FaStar className="icon" /> <span>التقييم</span>
              </Link>
            )}

            <button className="btn btn-danger" onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;