import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProfileSection = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // حالة جديدة للتحكم في عرض مؤشر التحميل

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true); // تفعيل حالة التحميل عند بدء جلب البيانات
        const token = localStorage.getItem('authToken');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser || !storedUser.id) {
          setError('User data not found.');
          setLoading(false);
          setIsLoading(false); // إيقاف حالة التحميل
          return;
        }

        const response = await axios.get(
          `https://newhrsys-production.up.railway.app/api/user-get/${storedUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
      } catch (err) {
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
        setIsLoading(false); // إيقاف حالة التحميل
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="card dashboard-card">
      <div className="card-header">Profile Overview</div>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {user && (
            <img
              src={user.image_path || '/default-avatar.png'}
              className="rounded-circle me-3"
              alt="Profile"
              style={{ width: '80px', height: '80px' }}
            />
          )}
          <div>
            <h4>{user ? `${user.first_name} ${user.last_name}` : 'Loading...'}</h4>
            <p className="text-muted mb-0">{user?.role?.name || 'No Role'}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <p><strong>Employee ID:</strong> {user?.user_code || 'Loading...'}</p>
            <p><strong>Department:</strong> {user?.department?.name || 'No Department'}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Email:</strong> {user?.email || 'Loading...'}</p>
            <p><strong>Phone:</strong> {user?.phone || 'No Phone'}</p>
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
