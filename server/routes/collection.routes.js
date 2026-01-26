import express from 'express';
import Collection from '../models/Collection.js';
import Note from '../models/Note.js';
import {requireAuth} from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * create a new collection
 */

router.post('/', requireAuth, async(req, res)=>{
    try {
        const {name} = req.body;

        const collection = await Collection.create({
            /**
             * name : title,
             * owner : req.user._id,
             * notes : []
             */

            name : name || "Untitled Collection",
            owner : req.user._id,
            notes : []
        });

        req.user.collections.push(collection._id);
        await req.user.save();

        res.status(201).json(collection);

    }
    catch(error) {
        console.error("Create Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/**
 * get all collections of the logged-in user
 */

router.get('/', requireAuth, async(req, res)=>{
    try {
        const collections = await Collection.find({ owner : req.user._id})
            .populate('notes' ,"title type updatedAt")
            .sort({ updatedAt : -1 });

            // we are populating only title, type and updatedAt fields of notes inside the collections.notes array

        res.json({ collections });
    }
    catch(error) {
        console.error("Get Collections Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/**
 * get single collection by id
 */

router.get('/:id', requireAuth, async(req, res)=> {
    try {
        const collectionId =  req.params.id;
        const collection = await Collection.findById(collectionId)
            .populate('notes', 'title type updatedAt colorScheme');

        if (!collection) {
            return res.status(404).json({ message: "Collection Not Found" });
        }

        if (!collection.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json({ collection });
    }
    catch(error) {
        console.error("Get Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/*
* rename collection
*/

router.put('/:id', requireAuth, async(req, res)=>{
    try {
        const collectionId = req.params.id;
        const collection = await Collection.findById(collectionId);

        if (!collection) {
            return res.status(404).json({ message: "Collection Not Found" });
        }

        if (!collection.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { name } = req.body;

        if (name) {
            collection.name = name;
            await collection.save();
        }
        res.json({ message : "Collection updated successfully", collection });
    }
    catch(error) {
        console.error("Update Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/*
* delete collection
*/

router.delete('/:id', requireAuth, async(req, res)=>{
    try {
        const collectionId = req.params.id;
        const collection = await Collection.findById(collectionId);

        if (!collection) {
            return res.status(404).json({ message: "Collection Not Found" });
        }
        if (!collection.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        

        // remove collection from all notes
        await Note.updateMany(
            {_id : { $in : collection.notes } },
            { $set : { collection : null } }
        );

        // remove collection from user's collections array
        req.user.collections = req.user.collections.filter(
            id => id.toString() !== collectionId.toString()
        );

        await req.user.save();

        await Collection.deleteOne({_id : collectionId});

        res.json({ message : "Collection deleted successfully" });
    }
    catch(error) {
        console.error("Delete Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/*
* add note to collection
*/

router.post('/:id/add-notes', requireAuth, async(req, res)=> {
    try {
        const { noteId } = req.body;
        const collectionId = req.params.id;

        const collection = await Collection.findById(collectionId);
        if (!collection) {
            return  res.status(404).json({ message: "Collection Not Found" });
        }

        const note =  await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note Not Found" });
        }

        if (!collection.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await Collection.updateOne(
            { _id : collectionId },
            { $addToSet : { notes : note._id } }
        );
        // $addToSet prevents duplicates

        note.collection = collection._id;
        await note.save();
        res.json({ message : "Note added to collection successfully" });
    }
    catch(error) {
        console.error("Add Note to Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

/*
* remove note from collection
*/

router.put('/:id/remove-note', requireAuth, async(req, res)=> {
    try {
        const { noteId } = req.body;
        const collectionId = req.params.id;
        const collection = await Collection.findById(collectionId);
        if (!collection) {
            return  res.status(404).json({ message: "Collection Not Found" });
        }
        if (!collection.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Check if note exists in collection first
        const noteInCollection = collection.notes.some(id => id.toString() === noteId.toString());
        if (!noteInCollection) {
            return res.status(400).json({ message: "Note not in collection" });
        }

        // Try to find the note, but don't fail if it doesn't exist (it might have been deleted)
        const note = await Note.findById(noteId);
        if (note) {
            note.collection = null;
            await note.save();
        }

        // Remove note from collection regardless of whether note exists in DB
        await Collection.updateOne(
            { _id : collectionId },
            { $pull : { notes : noteId } }
        );

        res.json({ message : "Note removed from collection successfully" });

    }
    catch(error) {
        console.error("Remove Note from Collection Error:", error);
        res.status(500).json({message : "Server Error"});
    }
});

export default router;


