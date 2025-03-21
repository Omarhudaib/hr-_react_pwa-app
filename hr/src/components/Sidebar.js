import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUserEdit, FaListAlt, FaFileAlt, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "../css/Sidebar.css"; // استيراد ملف CSS
import api from "../main/api";
import Swal from "sweetalert2";
const user = JSON.parse(localStorage.getItem("user")); // Get user data
const departmentId = user?.department_id; // Ensure it's defined
const Navbar = () => {
  const navigate = useNavigate(); 
  const [menuOpen, setMenuOpen] = useState(false); // التحكم في القائمة الجانبية
  const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

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
    <div class="navbar-container">
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
            <FaUserEdit className="icon" /> <span>الملف الشخصي</span>
          </Link>
          <Link to="/my-requests" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FaListAlt className="icon" /> <span>طلباتي</span>
          </Link>
          <Link to="/add-request" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FaFileAlt className="icon" /> <span>طلب جديد</span>
          </Link>
          
          {permissions.includes("View_User") && (
            <Link to="/Users" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaFileAlt className="icon" /> <span>الموظفون</span>
            </Link>
          )}

          {permissions.includes("Add_User") && (
            <Link to="/user/users/create" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FaFileAlt className="icon" /> <span>إضافة مستخدم</span>
            </Link>
          )}
{permissions.includes("Add_User") && departmentId && (
  <Link
    to={`/evaluate/${departmentId}`} // ✅ Use retrieved department ID
    className="nav-link"
    onClick={() => setMenuOpen(false)}
  >
    <FaFileAlt className="icon" /> <span>التقييم</span>
  </Link>
)}


          <button className="btn btn-danger" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </nav></div>
  );
};

export default Navbar;
