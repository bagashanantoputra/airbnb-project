const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line to import Schema

const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
