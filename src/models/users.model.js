import mongoose from 'mongoose';
import modelCarts from './carts.models.js';
import moment from 'moment';

mongoose.pluralize(null);

const collection = 'users';
const db = mongoose.connection.useDb('ecommerce')

const documentSchema = new mongoose.Schema({
    name: { type: String }, 
    reference: { type: String }
});
const date = moment().format('DD-MM-YYYY HH:mm:ss');

const schema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true},
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true},
    _cart_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    role: { type: String, enum: ['ADMIN', 'PREMIUM', 'USER'], default: 'USER'},
    documents: [ documentSchema ],
    last_connection: { type: Date, default: 2024 }
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