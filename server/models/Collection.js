import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },

    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    notes : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Note',
    }]
},
    { timestamps: true }
);

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;