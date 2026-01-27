import api from './axios.js';

const fetchNotes = (collaboratorId = null) => {
  const url = collaboratorId
    ? `/notes?with=${collaboratorId}`
    : `/notes`;

  return api.get(url);
};

const createNote = (noteData) => api.post('/notes', noteData);

const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);

const addCollaborator = (noteId, email) => api.post(`/notes/${noteId}/add-collaborator` , {email});

export {fetchNotes, createNote, deleteNote, addCollaborator};