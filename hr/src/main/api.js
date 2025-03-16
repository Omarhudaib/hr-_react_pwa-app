
  import axios from 'axios';

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // قم بتغيير هذا حسب خادمك
  
  });
  
  // Add a request interceptor for token handling
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken'); // أو من الكوكيز
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  export default api;