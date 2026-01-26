import { useEffect, useState } from "react";
import { fetchNotes } from "../api/note.api";
import { fetchCollections } from "../api/collection.api";
import { getMe, logout } from "../api/auth.api";

import Sidebar from "../components/layout/Sidebar";
import NoteCard from "../components/notes/NoteCard";
import CreateNoteModal from "../components/notes/CreateNoteModal";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [owned, setOwned] = useState([]);
  const [shared, setShared] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // fetch logged-in user
        const meRes = await getMe();
        setUser(meRes.data);

        // fetch notes
        const notesRes = await fetchNotes();
        setOwned(notesRes.data.owned);
        setShared(notesRes.data.shared);

        // fetch collections
        const collectionsRes = await fetchCollections();
        setCollections(collectionsRes.data.collections);
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
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

        {/* Owned Notes */}
        <h2 className="text-lg font-medium mb-3">Owned</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {owned.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>

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
      </main>

      {showModal && (
        <CreateNoteModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
