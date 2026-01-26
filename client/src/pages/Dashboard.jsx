import {useEffect, useState} from 'react';
import {fetchNotes} from '../api/note.api.js';
import {fetchCollections} from '../api/collection.api.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import NoteCard from '../components/notes/NoteCard.jsx';
import CreateNoteModal from '../components/notes/CreateNoteModal.jsx';

const Dashboard = () => {
    const [owned, setOwned] = useState([]);
    const [shared, setShared] = useState([]);
    const [collections, setCollections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // showmodal state to control CreateNoteModal visibility

    useEffect(() => {
        const loadData = async () =>{
            try {
                const notesResponse = await fetchNotes();

                //res.json({
                //     owned : ownedNotes,
                //     shared : sharedNotes
                // });
                // response data got from fetchNotes
                setOwned(notesResponse.data.owned);
                setShared(notesResponse.data.shared);

                const collectionsResponse = await fetchCollections();
                // response data got from fetchCollections
                // res.json({ collections : user.collections });

                setCollections(collectionsResponse.data.collections);
            }
            catch(error) {
                console.error("Dashboard Load Data Error:", error);
            }
        };
        loadData();
    }, []);

    return (
        <div className = "flex h-screen bg-white">
            <Sidebar collections = {collections}></Sidebar>

            <div className = "flex-1 p-6 overflow-y-auto">
                <div className = "flex justify-between mb-6">
                    <h1 className = "text-2xl font-semibold">Your Notes</h1>
                    <button
                        onClick = {() => setShowModal(true)}
                        className = "px-4 py-2 bg-black-500 text-white rounded hover:bg-black-700 transition"
                    >
                        Create Note
                    </button>
                </div>
                <h2 className = "text-lg mb-3">Owned</h2>
                <div className = "grid grid-cols-4 gap-4">
                    {owned.map((note) => (
                        <NoteCard key = {note._id} note = {note} />
                    ))}
                </div>

                {shared.length > 0 && (
                    <>
                        <h2 className = "text-lg mt-8 mb-3">Shared with You</h2>
                        <div className = "grid grid-cols-4 gap-4">
                            {shared.map((note) => (
                                <NoteCard key = {note._id} note = {note} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <CreateNoteModal
                    onClose = {() => setShowModal(false)}
                />
            )}
        </div>
            

    )
}
export default Dashboard;