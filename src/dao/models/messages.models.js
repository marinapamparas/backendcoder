import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'users';

const schema = new mongoose.Schema({
    nombre:{ type: String, required: true },
    email:{ type: String, required: true },
    password:{ type: String, required: true },
    role:{ type: String, enum: ['admin', 'premium', 'user'], default: 'user' }
});

const modelMessages = mongoose.model(collection, schema);

export default modelMessages;