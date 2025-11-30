import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },

    name : {
        type :String,
        required: true
    },
    email : {
        type :String,
        required: true,
        unique: true,
        lowercase: true
    },
    photo : {
        type :String,
        // google profile picture URL
    },

    /*
    notesOwned = {created + collaborated}
    */ 
    notesOwned: [{
        type: Schema.Types.ObjectId,
        // Schema type is ObjectId to reference another document
        ref: 'Note'
    }],
    /*
    notesShared = collaborated only
    */
    notesShared: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }],

    /**
     * array of collection folders
     */

    collections: [{
        type: Schema.Types.ObjectId,
        ref: 'Collection'
    }],
    
    refreshTokens: {
        type: [String],
        default: []
    }
}, 
    {timestamps: true}

);

export default mongoose.model('User', UserSchema);