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
  const [showModal, setShowModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which view to show based on the current path
  const currentPath = location.pathname;
  const isOwnedView = currentPath === '/dashboard/owned';
  const isSharedView = currentPath === '/dashboard/shared';
  const isAllView = currentPath === '/dashboard';

  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Wait for user to be loaded from AuthContext
      
      setLoading(true);
      setError(null);
      
      try {
        // fetch notes
        const notesRes = await fetchNotes();
        setOwned(notesRes.data.owned || []);
        setShared(notesRes.data.shared || []);

        // fetch collections
        const collectionsRes = await fetchCollections();
        setCollections(collectionsRes.data.collections || []);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login"); // Navigate anyway
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      // Reload notes
      const notesRes = await fetchNotes();
      setOwned(notesRes.data.owned || []);
      setShared(notesRes.data.shared || []);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete note error:", error);
      setError(error.response?.data?.message || "Failed to delete note");
      setDeleteConfirm(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar
        user={user}
        // usr: { name: string, email: string }
        collections={collections}
        onLogout={handleLogout}
        onCollectionUpdate={async () => {
          try {
            const collectionsRes = await fetchCollections();
            setCollections(collectionsRes.data.collections || []);
          } catch (error) {
            console.error("Failed to refresh collections:", error);
          }
        }}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {isOwnedView ? 'Owned Notes' : isSharedView ? 'Shared Notes' : 'Your Notes'}
            </h1>
            <p className="text-sm text-gray-500">
              {isOwnedView ? 'Notes you own' : isSharedView ? 'Notes shared with you' : 'Manage and organize your notes'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              New Collection
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Create Note
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              <div className="text-gray-500 text-sm">Loading notes...</div>
            </div>
          </div>
        ) : (
          <>
            {/* All Notes View */}
            {isAllView && (
              <>
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                    All Notes
                  </h2>
                  {owned.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                      <p className="text-gray-400 mb-2">No notes yet</p>
                      <p className="text-sm text-gray-500">Create your first note to get started!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {owned.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note} 
                          onDelete={(id) => setDeleteConfirm({ id, title: note.title })}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Shared Notes Section (only in All Notes view) */}
                {shared.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                      Shared with you
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {shared.map((note) => (
                        <NoteCard 
                          key={note._id} 
                          note={note}
                          onDelete={(id) => setDeleteConfirm({ id, title: note.title })}
                          showDelete={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Owned Notes View */}
            {isOwnedView && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                  Your Notes
                </h2>
                {owned.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <p className="text-gray-400 mb-2">No owned notes yet</p>
                    <p className="text-sm text-gray-500">Create your first note to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {owned.map((note) => (
                      <NoteCard 
                        key={note._id} 
                        note={note} 
                        onDelete={(id) => setDeleteConfirm({ id, title: note.title })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shared Notes View */}
            {isSharedView && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                  Shared with you
                </h2>
                {shared.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <p className="text-gray-400 mb-2">No shared notes yet</p>
                    <p className="text-sm text-gray-500">Notes shared with you will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {shared.map((note) => (
                      <NoteCard 
                        key={note._id} 
                        note={note}
                        onDelete={(id) => setDeleteConfirm({ id, title: note.title })}
                        showDelete={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <CreateNoteModal 
          onClose={() => setShowModal(false)} 
          collections={collections}
        />
      )}

      {showCollectionModal && (
        <CreateCollectionModal 
          onClose={() => setShowCollectionModal(false)}
          onSuccess={async () => {
            // Refresh collections
            try {
              const collectionsRes = await fetchCollections();
              setCollections(collectionsRes.data.collections || []);
            } catch (error) {
              console.error("Failed to refresh collections:", error);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Note?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirm.id)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
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
