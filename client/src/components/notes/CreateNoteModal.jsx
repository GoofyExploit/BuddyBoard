import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { createNote, addCollaborator } from "../../api/note.api";

const CreateNoteModal = ({ onClose, collections = [], onCreated }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("personal");
  const [collectionId, setCollectionId] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorError, setCollaboratorError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = () => {
    if (!isValidEmail(collaboratorEmail)) {
      setCollaboratorError("Invalid email format");
      return;
    }

    if (collaborators.includes(collaboratorEmail)) {
      setCollaboratorError("Email already added");
      return;
    }

    setCollaborators([...collaborators, collaboratorEmail]);
    setCollaboratorEmail("");
    setCollaboratorError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCollaboratorError("");

    try {
      // 1️⃣ Create note
      const res = await createNote({
        title: title || "Untitled Note",
        type,
        collectionId: collectionId || null,
        backgroundColor,
      });

      const noteId = res.data._id;

      // 2️⃣ Add collaborators (backend validates existence)
      if (type === "collaborative") {
        for (const email of collaborators) {
          try {
            await addCollaborator(noteId, email);
          } catch (err) {
            setCollaboratorError(
              err.response?.data?.message || "Failed to add collaborator"
            );
            setLoading(false);
            return;
          }
        }
      }

      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-5">Create New Note</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="personal">Personal</option>
            <option value="collaborative">Collaborative</option>
          </select>

          {/* Background Color */}
          <div>
            <p className="text-sm font-medium mb-2">Background</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBackgroundColor("#FFFFFF")}
                className={`w-10 h-10 rounded border ${
                  backgroundColor === "#FFFFFF"
                    ? "ring-2 ring-black"
                    : ""
                }`}
                style={{ backgroundColor: "#FFFFFF" }}
              />
              <button
                type="button"
                onClick={() => setBackgroundColor("#000000")}
                className={`w-10 h-10 rounded border ${
                  backgroundColor === "#000000"
                    ? "ring-2 ring-black"
                    : ""
                }`}
                style={{ backgroundColor: "#000000" }}
              />
            </div>
          </div>

          {/* Collection */}
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">No Collection</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Collaborators */}
          {type === "collaborative" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Collaborators (Email)</p>

              <div className="flex gap-2">
                <input
                  value={collaboratorEmail}
                  onChange={(e) => {
                    setCollaboratorEmail(e.target.value);
                    setCollaboratorError("");
                  }}
                  placeholder="user@example.com"
                  className="flex-1 border px-3 py-2 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addEmail}
                  className="px-3 bg-black text-white rounded-lg"
                >
                  <FiPlus />
                </button>
              </div>

              {collaboratorError && (
                <p className="text-sm text-red-600">
                  {collaboratorError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {collaborators.map((email) => (
                  <span
                    key={email}
                    className="px-2 py-1 bg-gray-100 rounded text-sm"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="flex-1 bg-black text-white rounded-lg py-2"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
