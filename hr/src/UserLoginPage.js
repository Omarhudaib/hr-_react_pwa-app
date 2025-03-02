import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import img from "./Userspages/logo512.png";
import InstallButton from "./InstallButton";

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
            const response = await axios.post('https://newhrsys-production.up.railway.app/api/user-login', formData);
            const { token, user } = response.data;

            // حفظ التوكن والبيانات في localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            // إعادة التوجيه للصفحة الرئيسية
            navigate('/home');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f0f0f0" }}>
            <div className="p-4 shadow card w-100" style={{ maxWidth: '400px', borderRadius: '10px' }}>
                <div className="text-center mb-4">
                    <InstallButton />
                    <img src={img} alt="Logo" style={{ maxWidth: '120px' }} />
                </div>
                <h2 className="mb-4 text-center">User Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 form-group">
                        <label htmlFor="user_code">User Code</label>
                        <input
                            type="text"
                            id="user_code"
                            name="user_code"
                            className="form-control"
                            placeholder="Enter your user code"
                            value={formData.user_code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3 form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default UserLoginPage;
