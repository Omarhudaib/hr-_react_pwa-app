import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Multiselect } from "multiselect-react-dropdown";
import api from "../../main/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Sidebar from "../../components/Sidebar";
import "../../css/Evaluation.css";
const getRatingColor = (rating) => {
  if (rating <= 10) return "#ff6b6b"; // Low
  if (rating <= 20) return "#ffd93d"; // Medium
  return "#6c5ce7"; // High
};
const EmployeeEvaluation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const companyCode = user?.company_id;
  const isAdmin = user?.is_department_admin;
  const adminDepartments = user?.admin_departments || [];
  const useradmin = user.id;

  // State Management
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      alert("Access Denied: You are not an admin.");
      navigate("/home");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
          console.error("User not found in localStorage");
          navigate("/login");
          return;
        }

        // Format department options
        const options = storedUser.admin_departments?.map(dept => ({
          id: dept.id,
          name: dept.dep_name ? dept.dep_name.trim() : "Unnamed Department",
        })) || [];

        setDepartmentOptions(options);

        // Fetch company settings
        const settingsResponse = await api.get(`/company/settings/${storedUser.company_id}`);
        setCompanySettings(settingsResponse.data);

      } catch (error) {
        console.error("Initial data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [navigate]);

  useEffect(() => {
    if (selectedDepartments.length) {
      const departmentIds = selectedDepartments.map(dept => dept.id);
      fetchUsers(departmentIds);
    } else {
      setUsers([]);
    }
  }, [selectedDepartments]);

  const fetchUsers = async (departments) => {
    if (!departments.length) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/users/evaluat", {
        params: { companyCode, departments: departments.join(",") },
      });

      // Process users and evaluations
      const processedUsers = response.data.users.map(user => ({
        user_id: user.user_id || user.id,
        department_id: user.department_id || user.dep_id,
        first_name: user.first_name,
        last_name: user.last_name,
        department_name: user.dep_name || "Unknown Dept",
        evaluations: user.evaluations || [],
      }));

      setUsers(processedUsers);

    } catch (error) {
      console.error("User fetch error:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (compositeKey, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [compositeKey]: {
        ...prev[compositeKey],
        [field]: value,
        ...(companySettings?.auto_set_date &&
          field === "rating" &&
          !prev[compositeKey]?.evaluation_date && {
            evaluation_date: new Date().toISOString().split("T")[0],
          }),
      },
    }));
  };

  const submitEvaluation = async (compositeKey) => {
    const [userId, departmentId] = compositeKey.split("-");
    const evaluationData = evaluations[compositeKey];

    if (!evaluationData?.rating) {
      alert("Please provide a rating");
      return;
    }

    try {
      await api.post(`/evaluations/${companyCode}`, {
        ...evaluationData,
        user_id: parseInt(userId),
        department_id: parseInt(departmentId),
        evaluated_by: useradmin,
        company_id: companyCode,
      });

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u.user_id === parseInt(userId) && u.department_id === parseInt(departmentId)
            ? { ...u, evaluations: [...(u.evaluations || []), evaluationData] }
            : u
        )
      );

      alert("Evaluation saved successfully");
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Evaluation failed");
    }
  };


  const renderEvaluationFields = (user) => {
    const compositeKey = `${user.user_id}-${user.department_id}`;
    const evaluation = evaluations[compositeKey] || {};
  
    return (
      <div className="card p-3 mb-3 evaluation-card">
        <div className="mb-3">
          <label className="form-label">Rating:</label>
          <div className="rating-slider-container">
            <input
              type="range"
              className="form-range"
              min="1"
              max={companySettings?.max_rating || 30}
              value={evaluation.rating || 1}
              onChange={(e) =>
                handleEvaluationChange(compositeKey, "rating", e.target.value)
              }
            />
            <span className="rating-value">
              {evaluation.rating || 1}/{companySettings?.max_rating || 30}
            </span>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Evaluation Date:</label>
          <input
            type="date"
            className="form-control"
            value={evaluation.evaluation_date || ""}
            onChange={(e) =>
              handleEvaluationChange(compositeKey, "evaluation_date", e.target.value)
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Comments:</label>
          <textarea
            className="form-control"
            placeholder="Enter comments"
            value={evaluation.comments || ""}
            onChange={(e) =>
              handleEvaluationChange(compositeKey, "comments", e.target.value)
            }
          />
        </div>
        <button
          onClick={() => submitEvaluation(compositeKey)}
          className="btn btn-primary w-100"
        >
          Save Evaluation
        </button>
      </div>
    );
  };

  const renderUserCard = (user) => (
    <div className="col-md-6 col-lg-4 mb-4" key={`${user.user_id}-${user.department_id}`}>
      <div className="card h-100">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">{user.first_name} {user.last_name}</h5>
    
        </div>
        <div className="card-body">
    
<div className="mb-3 d-none"> {/* Added d-none */}
  <label className="form-label">User ID:</label>
  <input 
    type="text" 
    className="form-control" 
    value={user.user_id} 
    disabled 
  />
</div>

<div className="mb-3 d-none"> {/* Added d-none */}
  <label className="form-label">Department ID:</label>
  <input 
    type="text" 
    className="form-control" 
    value={user.department_id} 
    disabled 
  />
</div>
          {renderEvaluationFields(user)}
          {user.evaluations?.length > 0 && (
           <div className="previous-evaluations mt-3">
           <h6>Previous Evaluations:</h6>
           {user.evaluations.map((evaluation, index) => (
             <div key={index} className="evaluation-item border p-2 rounded mb-2">
               <div className="d-flex align-items-center">
                 <div
                   className="evaluation-circle"
                   style={{
                     width: "50px",
                     height: "50px",
                     borderRadius: "50%",
                     backgroundColor: getRatingColor(evaluation.rating),
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "#fff",
                     fontSize: "1rem",
                     fontWeight: "bold",
                   }}
                 >
                   {evaluation.rating}
                 </div>
                 <div className="ms-3">
                   <p className="mb-0">
                     <strong>Date:</strong>{" "}
                     {new Date(evaluation.evaluation_date).toLocaleDateString()}
                   </p>
                   <p className="mb-0">
                     <strong>Comments:</strong> {evaluation.comments}
                   </p>
                 </div>
               </div>
             </div>
           ))}
         </div>
          )}
        </div>
      </div>
    </div>
  );

  return (<><Sidebar />
    <div className="d-flex flex-column min-vh-100">
      {/* Header with Sidebar */}
     
      {/* Main Content */}
      <div className="container-fluid flex-grow-1 p-4 mb-2">
        {/* Department Selection */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Select Departments:</label>
                <Multiselect
                  options={departmentOptions}
                  selectedValues={selectedDepartments}
                  onSelect={setSelectedDepartments}
                  onRemove={setSelectedDepartments}
                  displayValue="name"
                  placeholder="Choose departments"
                  style={{
                    chips: { background: "#007bff", color: "#fff" },
                    searchBox: { border: "1px solid #ced4da", borderRadius: "4px", Hight:"1rem" },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Grid */}
        <div className="row g-4">
          {loading ? (
            <div className="col text-center">
              <LoadingSpinner />
            </div>
          ) : (
            users.map(user => renderUserCard(user))
          )}
        </div>
      </div>
    </div></>
  );
};

export default EmployeeEvaluation;