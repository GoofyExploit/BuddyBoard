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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        // usr: { name: string, email: string }
        collections={collections}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Notes</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            + Create Note
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading notes...</div>
          </div>
        ) : (
          <>
            {/* Owned Notes */}
            <h2 className="text-lg font-medium mb-3">Owned</h2>
            {owned.length === 0 ? (
              <p className="text-gray-500 mb-6">No notes yet. Create your first note!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {owned.map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            )}

            {/* Shared Notes */}
            {shared.length > 0 && (
              <>
                <h2 className="text-lg font-medium mt-8 mb-3">
                  Shared with you
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shared.map((note) => (
                    <NoteCard key={note._id} note={note} />
                  ))}
                </div>
              </>
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
