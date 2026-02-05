import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// ESTO HACE QUE TODAS LAS FUNCIONES (fetchCats, handleCreate, etc.) MANDEN EL TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenAdmin");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;