import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import HomeUser from './HomeUser';
import EditProfile from './EditProfile';
import MyRequest from './MyRequest';
import UserLoginPage from './UserLoginPage';
import LeaveRequest from './LeaveRequest';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

// Configure axios interceptors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/'; // Redirect to root/login page
    }
    return Promise.reject(error);
  }
);

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  
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
        <Route path="/home" element={
          <PrivateRoute>
            <HomeUser />
          </PrivateRoute>
        }/>
        
        <Route path="/edit-profile" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }/>
        
        <Route path="/my-requests" element={
          <PrivateRoute>
            <MyRequest />
          </PrivateRoute>
        }/>
        
        <Route path="/add-request" element={
          <PrivateRoute>
            <LeaveRequest />
          </PrivateRoute>
        }/>
        

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;