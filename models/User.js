const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },    
    Admin: {
        type: Number,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now        
    }
});

mongoose.model("Users", User);
