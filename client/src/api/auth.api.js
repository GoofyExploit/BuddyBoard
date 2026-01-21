import api from './axios.js';

const getMe = () => api.get('/auth/me');

const logout = () => api.post('/auth/logout');

// login is redirected to backend oauth route, so no need to create login function here
export {getMe, logout};