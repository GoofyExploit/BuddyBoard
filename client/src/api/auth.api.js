import api from './axios.js';

const getMe = () => api.get('/auth/me');
// getme returns { id: string, name: string, email: string }

const logout = () => api.post('/auth/logout');

// login is redirected to backend oauth route, so no need to create login function here
export {getMe, logout};