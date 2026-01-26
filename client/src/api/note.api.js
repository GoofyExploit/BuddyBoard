import api from './axios.js';

const fetchNotes = () => api.get('/notes');

const createNote = (noteData) => api.post('/notes', noteData);

const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);

export {fetchNotes, createNote, deleteNote};