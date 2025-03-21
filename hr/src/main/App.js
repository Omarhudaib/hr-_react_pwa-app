import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";

// Components
import HomeUser from "../Userspages/HomeUser";
import EditProfile from "../Userspages/EditProfile";
import MyRequest from "../Userspages/MyRequest";
import UserLoginPage from "../Userspages/UserLoginPage";
import LeaveRequest from "../Userspages/LeaveRequest";
import Users from "../Permission/users/UserList";
import UserForm from "../Permission/users/UserCreat";
import UserForme from "../Permission/users/EditUser";
import UserDetail from "../Permission/users/UserDetail";
import EmployeeEvaluation from "../Permission/users/EmployeeEvaluation";
// Configure axios interceptors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<UserLoginPage />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomeUser />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <PrivateRoute>
              <MyRequest />
            </PrivateRoute>
          }
        />
                <Route
          path="/Users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
            <Route path="/user/users/:id" element={<UserDetail />} />
    <Route path="/user/users/create" element={<UserForm />} />
    <Route path="/user/users/edit/:id" element={<UserForme />} />
    <Route path="/evaluate/:department_id" element={<EmployeeEvaluation />} />

        <Route
          path="/add-request"
          element={
            <PrivateRoute>
              <LeaveRequest />
            </PrivateRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;