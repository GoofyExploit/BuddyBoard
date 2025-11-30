import express from 'express';
import Note from '../models/Note.js';
import User from '../models/User.js';
import Collection from '../models/Collection.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/*
* create note (personal or collaborative)
*/

router.post("/", requireAuth, async(req, res)=>{

    try {
        const {title, type, collectionId} = req.body;
        /**
         * title : note name,
         * type : 'personal' | 'collaborative'
         * CollectionId : optional, to add note to a collection folder
         */

        const note = new Note({
            title : title || "Untitled Note",
            type : type || 'personal',
            owner : req.user._id,
            collaborators : [],
            collection : collectionId || null,
            shapes : [],
            backgroundColor : "#FFFFFF"
        });

        const user = req.user;
        user.notesOwned.push(note._id);
        await user.save();

        // if CollectionId is provided, add note to that collection
        if (collectionId) {
            await Collection.findByIdAndUpdate(collectionId, {
                $push: { notes: note._id }
            });
        }

        res.status(201).json(note);
    }
    catch (error) {
        console.error("create note error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * get all notes (owned + shared)
 */

router.get("/", requireAuth, async(req, res)=> {
    try {
        const ownedNotes = await Note.find({ owner: req.user._id })
            .populate('collaborators', 'name email')
            .sort({updatedAt: -1});

        /**
         * before populating collaborators
         * 
         * "collaborators": [
                "673f1fe78a4e1b2fab9921a2",
                "673f1fa11b93934ab99bc1d2"
            ]
        * after populating collaborators
        * 
        * "collaborators": [
                {
                    "_id": "673f1fe78a4e1b2fab9921a2",
                    "name": "Jane Doe",
                    "email": "jane.doe@example.com"
                },
                {
                    "_id": "673f1fa11b93934ab99bc1d2",
                    "name": "John Smith",
                    "email": "john.smith@example.com"
                }
            ]

         */

        const sharedNotes = await Note.find({
            collaborators: req.user._id
        })
        .populate("owner", "name email")
        .sort({updatedAt: -1});

        res.json({
            owned : ownedNotes,
            shared : sharedNotes
        });
    }
    catch (error) {
        console.error("get notes error:", error);
        res.status(500).json({ message: "Server error" });
    }    
});

/**
 * get single note
 */

router.get("/:id", requireAuth, async(req, res)=>{
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId)
            .populate('owner', 'name email')
            .populate('collaborators', 'name email');

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        // check if requesting user is either owner or collaborator

        const allowed = 
            note.owner._id.equals(req.user._id) || 
            note.collaborators.includes(req.user._id);

        if (!allowed) {
            return res.status(403).json({
                message: "Forbidden"
            });
        };

        res.json(note);
    }
    catch (error) {
        console.error("get single note error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * updating note content (shapes, title, background color)
 */

router.put("/:id", requireAuth, async(req, res)=>{
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        // only owner or collaborator can update note

        const allowed = 
            note.owner.equals(req.user._id) || 
            note.collaborators.includes(req.user._id);

        if (!allowed) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        const {title, shapes, backgroundColor} = req.body;
        /**
         * title : updated note title
         * shapes : updated shapes array
         * backgroundColor : updated background color
         */

        if (title !== undefined) note.title = title;
        if (shapes !== undefined) note.shapes = shapes;
        // When saving in MongoDB, Mongoose automatically converts them to the Shape sub-schema
        if (backgroundColor !== undefined) note.backgroundColor = backgroundColor;

        await note.save();
        res.json({
            message : "Note updated", note
        });
    }
    catch (error) {
        console.error("update note error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * add collaborator to collaborative note
 */

router.post("/:id/add-collaborator", requireAuth, async(req, res)=>{
    try {
        const {email} = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({
                message : "Only owner can add collaborators"
            });
        }

        const userToAdd = await User.findOne({email});

        if (!userToAdd) {
            return res.status(404).json({
                message : "No user with this email"
            });
        }

        if (note.collaborators.includes(userToAdd._id)) {
            return res.status(400).json({
                message : "Already a collaborator"
            });
        }

        note.collaborators.push(userToAdd._id);

        if (note.type !== 'collaborative') {
            note.type = 'collaborative';
        }

        await note.save();

        userToAdd.notesShared.push(note._id);
        await userToAdd.save();

        res.json({
            message : "Collaborator added", note
        });
    }
    catch (error) {
        console.error("add collaborator error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * remove collaborator from collaborative note
 */

router.post("/:id/remove-collaborator", requireAuth, async(req, res)=> {
    try {
        const {userId} = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }
        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({
                message : "Only owner can remove collaborators"
            });
        }

        note.collaborators = note.collaborators.filter((id)=> id.toString() !== userId);
        await note.save();

        await User.findByIdAndUpdate(userId, {
            $pull: { notesShared: note._id }
        });
        res.json({
            message : "Collaborator removed", note
        });
    }
    catch (error) {
        console.error("remove collaborator error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * move to collection
 */

router.put("/:id/move-to-collection",requireAuth, async(req, res)=> {
    try {
        const {collectionId} = req.body;
        const noteId = req.params.id;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }
        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({
                message : "Only owner can move note to collection"
            });
        }

        let newCollection = null;
        if (collectionId) {
            newCollection = await Collection.findById(collectionId);
            if (!newCollection) {
                return res.status(404).json({
                    message: "Collection not found"
                });
            }

            if (!newCollection.owner.equals(req.user._id)) {
                return res.status(403).json({
                    message : "Cannot move note to a collection you don't own"
                });
            }
        }
        if (note.collection) {
            await Collection.findByIdAndUpdate(note.collection, {
                $pull: { notes: note._id }
            });
        }

        // add to new collection
        if (newCollection) {
            await Collection.updateOne(
                { _id: newCollection._id },
                { $addToSet: { notes: note._id } }
            );
            // $addToSet prevents duplicates
        }

        note.collection = newCollection ? newCollection._id : null;
        await note.save();

        res.json({
            message : "Note moved to collection", note
        });
        
    }
    catch (error) {
        console.error("move to collection error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * delete note
 */

router.delete("/:id", requireAuth, async(req, res)=>{
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }
        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({
                message : "Only owner can delete note"
            });
        }

        await Collection.updateMany(
            { notes: note._id },
            { $pull: { notes: note._id } }
        );

        req.user.notesOwned = req.user.notesOwned.filter((id)=> id.toString() !== noteId);

        await req.user.save();

        await Note.deleteOne({_id: noteId});

        res.json({
            message : "Note deleted"
        });
        
    }
    catch (error) {
        console.error("delete note error:", error);
        res.status(500).json({ message: "Server error" });
    }
});