import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },

    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    notes : [{
        type : Schema.Types.ObjectId,
        ref : 'Note',
    }]
},
    { timestamps: true }
);

collectionSchema.index({ owner: 1, name: 1 });
const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;