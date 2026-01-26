import { useState } from 'react';
import { createNote } from '../../api/note.api';
import { FiX } from 'react-icons/fi';

const CreateNoteModal = ({ onClose, collections = [] }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('personal');
    const [collectionId, setCollectionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createNote({ 
                title: title || 'Untitled Note', 
                type,
                collectionId: collectionId || null
            });
            onClose();
            // Reload the page to show the new note
            window.location.reload();
        } catch (error) {
            console.error('Create note error:', error);
            setError(error.response?.data?.message || 'Failed to create note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Note</h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Note Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter note title..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Type selection */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Note Type
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                        >
                            <option value="personal">Personal</option>
                            <option value="collaborative">Collaborative</option>
                        </select>
                    </div>

                    {/* Collection selection */}
                    <div>
                        <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-2">
                            Collection (Optional)
                        </label>
                        <select
                            id="collection"
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                        >
                            <option value="">No Collection</option>
                            {collections.map((collection) => (
                                <option key={collection.id || collection._id} value={collection.id || collection._id}>
                                    {collection.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNoteModal;
