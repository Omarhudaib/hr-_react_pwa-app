import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import img from "../Userspages/logo512.png";
import InstallButton from "../components/InstallButton";

const UserLoginPage = () => {
    const [formData, setFormData] = useState({ user_code: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // التحقق من وجود التوكن وإعادة التوجيه مباشرة إلى الصفحة الرئيسية
        if (localStorage.getItem('authToken')) {
            navigate('/home');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/user-login', formData);
            const { token, user, permissions, is_department_admin, admin_departments } = response.data;
    
            // Save data in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify({
                ...user,
                is_department_admin,  // ✅ Store admin status
                admin_departments     // ✅ Store department IDs
            }));
            localStorage.setItem('permissions', JSON.stringify(permissions)); 
    
            // Redirect to home page
            navigate('/home');
        } catch (err) {
            setError('بيانات الدخول غير صحيحة. حاول مرة أخرى.');
        }
    };
    
    

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f0f0f0", height: "100vh" }}>
            <div className="p-4 shadow card w-100" style={{ maxWidth: '400px', borderRadius: '10px', height: 'auto' }}>
                <div className="text-center mb-4">
                    <InstallButton />
                    <img src={img} alt="Logo" style={{ maxWidth: '170px' }} />
                </div>
                <h2 className="mb-4 text-center" style={{ fontFamily: 'Tajawal, sans-serif' }}>تسجيل الدخول</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 form-group">
                        <label htmlFor="user_code">رمز المستخدم</label>
                        <input
                            type="text"
                            id="user_code"
                            name="user_code"
                            className="form-control"
                            placeholder="أدخل رمز المستخدم"
                            value={formData.user_code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3 form-group">
                        <label htmlFor="password">كلمة المرور</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            placeholder="أدخل كلمة المرور"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">دخول</button>
                </form>
            </div>
        </div>
    );
};

export default UserLoginPage;
