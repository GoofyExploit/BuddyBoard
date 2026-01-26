import { useEffect, useState } from "react";
import { fetchNotes } from "../api/note.api";
import { fetchCollections } from "../api/collection.api";
import { logout } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/layout/Sidebar";
import NoteCard from "../components/notes/NoteCard";
import CreateNoteModal from "../components/notes/CreateNoteModal";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [owned, setOwned] = useState([]);
  const [shared, setShared] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Notes</h1>
            <p className="text-sm text-gray-500">Manage and organize your notes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Create Note
          </button>
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
            {/* All Notes */}
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
                    <NoteCard key={note._id} note={note} />
                  ))}
                </div>
              )}
            </div>

            {/* Shared Notes */}
            {shared.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                  Shared with you
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {shared.map((note) => (
                    <NoteCard key={note._id} note={note} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <CreateNoteModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
