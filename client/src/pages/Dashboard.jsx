import { useEffect, useState } from "react";
import { fetchNotes, deleteNote } from "../api/note.api";
import { fetchCollections } from "../api/collection.api";
import { logout } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/layout/Sidebar";
import NoteCard from "../components/notes/NoteCard";
import CreateNoteModal from "../components/notes/CreateNoteModal";
import CreateCollectionModal from "../components/collections/CreateCollectionModal";
import { useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [owned, setOwned] = useState([]);
  const [shared, setShared] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedSharedUser, setSelectedSharedUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isOwnedView = currentPath === "/dashboard/owned";
  const isSharedView = currentPath === "/dashboard/shared";
  const isAllView = currentPath === "/dashboard";

  /* ---------------------------------------------
     Build unique collaborators from shared notes
  --------------------------------------------- */
  const sharedOwners = Array.from(
    new Map(
      shared
        .map(note => note.owner)
        .filter(Boolean)
        .map(user => [user._id, user])
    ).values()
  );

  /* ---------------------------------------------
     Filter shared notes by selected collaborator
  --------------------------------------------- */
  const filteredShared = selectedSharedUser
    ? shared.filter(note => note.owner?._id === selectedSharedUser)
    : shared;

  /* ---------------------------------------------
     Load dashboard data
  --------------------------------------------- */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const notesRes = await fetchNotes();
      setOwned(notesRes.data.owned || []);
      setShared(notesRes.data.shared || []);

      const collectionsRes = await fetchCollections();
      setCollections(collectionsRes.data.collections || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  /* ---------------------------------------------
     Reset shared filter when leaving shared view
  --------------------------------------------- */
  useEffect(() => {
    if (!isSharedView) {
      setSelectedSharedUser(null);
    }
  }, [isSharedView]);

  /* ---------------------------------------------
     Logout
  --------------------------------------------- */
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  /* ---------------------------------------------
     Delete note
  --------------------------------------------- */
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      await loadData();
      setDeleteConfirm(null);
    } catch {
      setError("Failed to delete note");
      setDeleteConfirm(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ---------------------------------------------
     Reusable notes grid
  --------------------------------------------- */
  const renderNotes = (notes, allowDelete = true) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {notes.map(note => (
        <NoteCard
          key={note._id}
          note={note}
          showDelete={allowDelete}
          onDelete={
            allowDelete
              ? () =>
                  setDeleteConfirm({
                    id: note._id,
                    title: note.title,
                  })
              : undefined
          }
        />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar
        user={user}
        collections={collections}
        sharedOwners={sharedOwners}          
        selectedSharedUser={selectedSharedUser}
        onSelectSharedUser={setSelectedSharedUser}
        onLogout={handleLogout}
        onCollectionUpdate={loadData}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {isOwnedView
              ? "Owned Notes"
              : isSharedView
              ? "Shared Notes"
              : "Your Notes"}
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-5 py-2 border rounded"
            >
              + Collection
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-black text-white rounded"
            >
              + Note
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {loading ? (
          <div>Loading notes...</div>
        ) : (
          <>
            {isAllView && (
              <>
                {renderNotes(owned)}

                {filteredShared.length > 0 && (
                  <>
                    <h2 className="text-xl mt-10 mb-4">
                      Shared with you
                    </h2>
                    {renderNotes(filteredShared, false)}
                  </>
                )}
              </>
            )}

            {isOwnedView && renderNotes(owned)}
            {isSharedView && renderNotes(filteredShared, false)}
          </>
        )}
      </main>

      {/* CREATE NOTE */}
      {showModal && (
        <CreateNoteModal
          collections={collections}
          onClose={() => setShowModal(false)}
          onCreated={loadData}
        />
      )}

      {/* CREATE COLLECTION */}
      {showCollectionModal && (
        <CreateCollectionModal
          onClose={() => setShowCollectionModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <p className="mb-4">
              Delete "{deleteConfirm.title}"?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="text-red-600"
                onClick={() =>
                  handleDeleteNote(deleteConfirm.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
