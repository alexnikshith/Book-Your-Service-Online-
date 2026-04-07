import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api',
});

// Add a request interceptor to include JWT token
API.interceptors.request.use((req) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return req;
});

export default API;
