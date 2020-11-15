const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = Schema({
    Title: {
        type: String,
        required: true
    },
    Slug: {
        type: String,
        required: true
    },
    Content: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },    
    Category: {
        type: Schema.Types.ObjectId,
        ref: "Categories",
        required: true
    },
    Date: {
        type: Date,
        default: Date.now        
    }
});

mongoose.model("Posts", Post);