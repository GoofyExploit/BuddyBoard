import { useNavigate } from "react-router-dom";
import { FiTrash2, FiX } from "react-icons/fi";
import NotebookIcon from './NotebookIcon';

const NoteCard = ({ note, onDelete, onRemove, showDelete = true }) => {
    const navigate = useNavigate();
    // useNavigate hook to programmatically navigate

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (onDelete) {
            onDelete(note._id);
        }
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking remove
        if (onRemove) {
            onRemove(note._id);
        }
    };

    return (
        <div
            onClick={()=> navigate(`/note/${note._id}`)}
            className = "bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-lg hover:border-orange-200 cursor-pointer transition-all duration-200 group relative"
        >
            {/* Remove from Collection Button (takes priority over delete) */}
            {onRemove && (
                <button
                    onClick={handleRemoveClick}
                    className="absolute top-3 right-3 p-2 bg-orange-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-600 z-10"
                    title="Remove from collection"
                >
                    <FiX className="w-4 h-4" />
                </button>
            )}
            {/* Delete Button (only show if no remove handler) */}
            {!onRemove && showDelete && onDelete && (
                <button
                    onClick={handleDeleteClick}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Delete note"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            )}

            {/* Notebook Icon */}
            <div className="mb-3 flex items-center justify-center">
                <NotebookIcon colorScheme={note.colorScheme} size={140} />
            </div>
            
            <h3 className = "font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                {note.title}
            </h3>
            <p className = "text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
            </p>
        </div>
    );
};

export default NoteCard;