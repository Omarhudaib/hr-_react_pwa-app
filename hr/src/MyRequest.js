import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaListAlt, FaFileAlt, FaClock } from "react-icons/fa";
import "./HomeUser.css";
import Spinner from "./Spinner"
const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) navigate("/login");
    else fetchRequests(user.id);
  }, [navigate]);

  const fetchRequests = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/user-Request/${userId}`,
      );
      setRequests(response.data);
    } catch (err) {
      setError("فشل في جلب الطلبات.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      approved: "status-approved",
      rejected: "status-rejected"
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  return (
    <div className="mobile-app-container">
      <header className="app-header">
        <h1 className="app-title">طلباتي السابقة</h1>
      </header>

      <main className="app-main-content">
        {loading && <div className="app-alert info " style={{ padding:"25%" }}><Spinner/></div>}
        {error && <div className="app-alert error">{error}</div>}

        {!loading && requests.length === 0 && (
          <div className="app-card">
            <div className="card-body">
              <p className="text-center">لا توجد طلبات مرفوعة حتى الآن</p>
            </div>
          </div>
        )}

        {requests.map((request) => (
          <div className="app-card" key={request.id}>
            <div className="card-header">
              <FaClock className="card-icon" />
              <h3>{request.leave_type?.name}</h3>
            </div>
            <div className="card-body">
              <div className="request-details">
                <p>
                  <strong>تاريخ البدء:</strong> {request.start_date}
                </p>
                <p>
                  <strong>تاريخ الانتهاء:</strong> {request.end_date}
                </p>
                <p>
                  <strong>الحالة:</strong> {getStatusBadge(request.status)}
                </p>
                {request.reason && (
                  <p>
                    <strong>السبب:</strong> {request.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
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
        <Link to="/add-request" className="nav-item">
          <FaFileAlt />
          <span>طلب جديد</span>
        </Link>
      </nav>
    </div>
  );
};

export default MyRequests;