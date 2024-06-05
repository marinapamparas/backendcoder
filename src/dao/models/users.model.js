import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'users';
const db = mongoose.connection.useDb('ecommerce')
const schema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true},
    role: { type: String, enum: ['admin', 'premium', 'user'], default: 'user'}
});

const modelUsers = db.model(collection, schema);

export default modelUsers;