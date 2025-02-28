import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProfileSection = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Retrieve token

        const response = await axios.get(`https://newhrsys-production.up.railway.app/api/user-get/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`, // Add auth token
          },
        });

        setUser(response.data.user);
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="card dashboard-card">
      <div className="card-header">Profile Overview</div>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <img
            src={user.image_path || '/default-avatar.png'}
            className="rounded-circle me-3"
            alt="Profile"
            style={{ width: '80px', height: '80px' }}
          />
          <div>
            <h4>{user.first_name} {user.last_name}</h4>
            <p className="text-muted mb-0">{user.role?.name || 'No Role'}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <p><strong>Employee ID:</strong> {user.user_code}</p>
            <p><strong>Department:</strong> {user.department?.name || 'No Department'}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || 'No Phone'}</p>
          </div>
        </div>
        <Link to="/edit-profile" className="btn btn-dark w-100">
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileSection;
