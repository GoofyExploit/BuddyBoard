import { useNavigate } from "react-router-dom";

const NoteCard = ({ note}) => {
    const navigate = useNavigate();
    // useNavigate hook to programmatically navigate

    return (
        <div
            onClick={()=> navigate(`/note/${note._id}`)}
            className = "border p-4 rounded shadow hover:shadow-lg cursor-pointer transition"
        >
            <h3 className = "font-medium">{note.title}</h3>
            <p className = "text-sm text-gray-600 mt-2">
                Updated {new Date(note.updatedAt).toLocaleDateString()}
            </p>

        </div>
    );
};

export default NoteCard;