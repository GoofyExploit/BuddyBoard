import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const shapeSchema = new Schema ({
    id : { // unique identifier for each shape created by frontend
        type: String,
        required: true,
    },
    // type can be 'rectangle', 'circle', 'line', 'text', etc.
    type : {
        type : String,
        required: true,
    },

    // position &dimensions
    x : Number,
    y : Number,
    width : Number,
    height : Number,
    rotation : Number,

    // styling attributes
    stroke : String, // border color
    strokeWidth : Number,
    fill : String,   // color inside the shape
    fontSize : Number, // for text shapes
    text : String, // text content for text shapes

    points : [Number], // for lines arrows pencil etc

},
    {_id: false}
);

const noteSchema = new Schema({
    title : {
        type : String,
        default : "Untitled Note"
    },
    type : {
        type : String,
        enum : ['personal', 'collaborative'],
        default : 'personal'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    ],
    shapes : [shapeSchema],
    backgroundColor : {
        type : String,
        default : "#FFFFFF"
    }
},
    {timestamps: true}
);

export default mongoose.model('Note', noteSchema);
