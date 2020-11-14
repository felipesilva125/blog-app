const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = Schema({
    Name: {
        type: String,
        required: true
    },
    Slug: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now        
    }
});

mongoose.model("Categories", Category);