import api from './axios.js';

export const fetchCollections = () =>{
    return api.get('/collections');
}

