import axios from 'axios';

// creating axios instance so that we can set config like baseURL and headers
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // to send cookies with each request
});

export default api;