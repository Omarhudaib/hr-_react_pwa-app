
  import axios from 'axios';

  const api = axios.create({
    baseURL: 'https://newhrsys-production.up.railway.app/api', // قم بتغيير هذا حسب خادمك
  
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