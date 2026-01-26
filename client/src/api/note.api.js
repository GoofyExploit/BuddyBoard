import api from './axios.js';

const fetchNotes = () => api.get('/notes');

const createNote = (noteData) => api.post('/notes', noteData);

export {fetchNotes, createNote};