import api from './axios.js';

const fetchNotes = (collaboratorId = null) => {
  const url = collaboratorId
    ? `/notes?with=${collaboratorId}`
    : `/notes`;

  return api.get(url);
};

const fetchNote = (noteId) => api.get(`/notes/${noteId}`);

const createNote = (noteData) => api.post('/notes', noteData);

const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);

const updateNote = (noteId, noteData) => api.put(`/notes/${noteId}`, noteData);
/**
 * noteData
  * title : updated note title
  * shapes : updated shapes array
  * backgroundColor : updated background color
*/

const addCollaborator = (noteId, email) => api.post(`/notes/${noteId}/add-collaborator` , {email});

export {fetchNotes, fetchNote ,createNote, deleteNote, addCollaborator, updateNote};