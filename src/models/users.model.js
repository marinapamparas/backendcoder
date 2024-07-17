import mongoose from 'mongoose';
import modelCarts from './carts.models.js';

mongoose.pluralize(null);

const collection = 'users';
const db = mongoose.connection.useDb('ecommerce')
const schema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true},
    _cart_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    role: { type: String, enum: ['ADMIN', 'PREMIUM', 'USER'], default: 'USER'}
});

// Middleware de preconsulta para find y findOne
schema.pre('find', function () {
    this.populate({ path: '_cart_id', model: modelCarts });
});

schema.pre('findOne', function () {
    this.populate({ path: '_cart_id', model: modelCarts });
});



const modelUsers = db.model(collection, schema);

export default modelUsers;