import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeUser from './HomeUser';
import EditProfile from './EditProfile';
import MyRequest from './MyRequest';
import UserLoginPage from './UserLoginPage';
import LeaveRequest from './LeaveRequest';
import ProfileSection from './ProfileSection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLoginPage />} />
        <Route path="/home" element={<HomeUser />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/my-requests" element={<MyRequest />} />
        <Route path="/add-request" element={<LeaveRequest />} />
        <Route path="/profile" element={<ProfileSection />} />
      </Routes>
    </Router>
  );
}

export default App;
