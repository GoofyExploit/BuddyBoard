import { useNavigate } from "react-router-dom";
import NotebookIcon from './NotebookIcon';

const NoteCard = ({ note}) => {
    const navigate = useNavigate();
    // useNavigate hook to programmatically navigate

    return (
        <div
            onClick={()=> navigate(`/note/${note._id}`)}
            className = "bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-lg hover:border-orange-200 cursor-pointer transition-all duration-200 group"
        >
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