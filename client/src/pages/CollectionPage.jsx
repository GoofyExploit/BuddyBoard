import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCollection, deleteCollection, removeNoteFromCollection } from "../api/collection.api";
import { logout } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiTrash2, FiEdit2, FiX } from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import NoteCard from "../components/notes/NoteCard";
import { fetchCollections } from "../api/collection.api";

const CollectionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [collection, setCollection] = useState(null);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const [collectionRes, collectionsRes] = await Promise.all([
                    fetchCollection(id),
                    fetchCollections()
                ]);
                setCollection(collectionRes.data.collection);
                setCollections(collectionsRes.data.collections || []);
                setNewName(collectionRes.data.collection?.name || '');
            } catch (error) {
                console.error("Collection load error:", error);
                setError(error.response?.data?.message || "Failed to load collection");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, id]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/login");
        }
    };

    const handleDeleteCollection = async () => {
        try {
            await deleteCollection(id);
            navigate("/dashboard");
        } catch (error) {
            console.error("Delete collection error:", error);
            setError(error.response?.data?.message || "Failed to delete collection");
        }
    };

    const handleRename = async () => {
        try {
            const { updateCollection } = await import("../api/collection.api");
            await updateCollection(id, newName);
            setCollection({ ...collection, name: newName });
            setShowRenameModal(false);
            // Refresh collections list
            const collectionsRes = await fetchCollections();
            setCollections(collectionsRes.data.collections || []);
        } catch (error) {
            console.error("Rename collection error:", error);
            setError(error.response?.data?.message || "Failed to rename collection");
        }
    };

    const handleRemoveNote = async (noteId) => {
        try {
            await removeNoteFromCollection(id, noteId);
            // Refresh collection data
            const collectionRes = await fetchCollection(id);
            setCollection(collectionRes.data.collection);
        } catch (error) {
            console.error("Remove note error:", error);
            setError(error.response?.data?.message || "Failed to remove note");
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
                collections={collections}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                                <div className="text-gray-500 text-sm">Loading collection...</div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 shadow-sm">
                            {error}
                        </div>
                    ) : collection ? (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{collection.name}</h1>
                                    <p className="text-sm text-gray-500">
                                        {collection.notes?.length || 0} {collection.notes?.length === 1 ? 'note' : 'notes'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowRenameModal(true)}
                                        className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Notes Grid */}
                            {collection.notes?.length === 0 ? (
                                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                                    <p className="text-gray-400 mb-2">No notes in this collection</p>
                                    <p className="text-sm text-gray-500">Add notes to this collection to get started!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                    {collection.notes?.map((note) => (
                                        <NoteCard 
                                            key={note._id}
                                            note={note}
                                            onRemove={handleRemoveNote}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Collection?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{collection?.name}"? Notes in this collection will not be deleted, but they will be removed from the collection.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCollection}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowRenameModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rename Collection</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CollectionPage;
