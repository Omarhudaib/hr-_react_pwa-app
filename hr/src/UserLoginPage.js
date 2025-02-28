import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserLoginPage = () => {
    const [formData, setFormData] = useState({ user_code: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://newhrsys-production.up.railway.app/api/user-login', formData); // Update with your API endpoint
            const { token, user } = response.data;

            // Save token and user data to local storage
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Navigate to the home page or dashboard
            navigate('/Home');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (

          
                <div className="p-4 shadow card mt-5" style={{ maxWidth: '100%', width: '100%', height: '100%' }}>
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
                        <button type="submit" className="btn btn-primary w-100">Login</button>
                    </form>
          
            </div>
 
    );
};

export default UserLoginPage;
