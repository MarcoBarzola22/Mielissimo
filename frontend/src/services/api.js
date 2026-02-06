import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Ajustar si el puerto cambia en prod
});

export const fetchProducts = async () => {
    const response = await api.get('/productos');
    return response.data;
};

export const fetchCategories = async () => {
    const response = await api.get('/categorias');
    return response.data;
};

export const fetchConfig = async () => {
    const response = await api.get('/configuracion');
    return response.data;
};

export const submitPurchase = async (compraData) => {
    const response = await api.post('/compras', compraData);
    return response.data;
};

export default api;
