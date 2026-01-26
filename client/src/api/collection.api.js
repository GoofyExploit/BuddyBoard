import api from './axios.js';

export const fetchCollections = () => {
    return api.get('/collections');
}

export const fetchCollection = (id) => {
    return api.get(`/collections/${id}`);
}

export const createCollection = (name) => {
    return api.post('/collections', { name });
}

export const updateCollection = (id, name) => {
    return api.put(`/collections/${id}`, { name });
}

export const deleteCollection = (id) => {
    return api.delete(`/collections/${id}`);
}

export const addNoteToCollection = (collectionId, noteId) => {
    return api.post(`/collections/${collectionId}/add-notes`, { noteId });
}

export const removeNoteFromCollection = (collectionId, noteId) => {
    return api.put(`/collections/${collectionId}/remove-note`, { noteId });
}
