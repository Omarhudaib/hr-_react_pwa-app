import React, { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";
import "./HomeUser.css";
import { FaHome,  FaListAlt} from "react-icons/fa";
import Swal from "sweetalert2";

const LeaveRequest = () => {
  const [requestType, setRequestType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) navigate("/login");
    setUser(userData);
    if (userData?.company_id) fetchLeaveTypes(userData.company_id);
  }, [navigate]);

  const fetchLeaveTypes = async (companyId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(
        `/leave-types/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveTypes(response.data);
    } catch (err) {
      setError("فشل في جلب أنواع الإجازات.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestType || !startDate || !endDate) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'يرجى ملء جميع الحقول المطلوبة.',
      });
      return;
    }
  
    setLoading(true);
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("leave_type_id", requestType);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("reason", description);
    if (image) formData.append("image_path", image);
  
    try {
      const token = localStorage.getItem("authToken");
      await api.post(
        `/user-submitRequest/${user.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("تم تقديم الطلب بنجاح!");
      Swal.fire({
        icon: 'success',
        title: 'تم!',
        text: 'تم تقديم الطلب بنجاح.',
      });
      setRequestType("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setImage(null);
      setError("");
    } catch (err) {
      setError("فشل تقديم الطلب.");
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'فشل تقديم الطلب.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">طلب إجازة جديد</h1>
      </header>

      <main className="app-main-content">
        {success && <div className="app-alert success">{success}</div>}
        {error && <div className="app-alert error">{error}</div>}

        <div className="app-card">
          <div className="card-header">
            <FaFileAlt className="card-icon" />
            <h3>نموذج تقديم طلب</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>نوع الطلب</label>
                <select
                  className="form-control"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">اختر نوع الطلب</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>تاريخ البدء</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>تاريخ الانتهاء</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>الوصف</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>إرفاق ملف</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setImage(e.target.files[0])}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="app-btn success"
                disabled={loading}
              >
                {loading ? "جاري الإرسال..." : "إرسال الطلب"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <FaHome />
          <span>الرئيسية</span>
        </Link>
        <Link to="/my-requests" className="nav-item">
          <FaListAlt />
          <span>طلباتي</span>
        </Link>
      </nav>
    </div>
  );
};

export default LeaveRequest;