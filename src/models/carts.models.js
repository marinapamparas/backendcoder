import mongoose from 'mongoose';
import modelUsers from './users.model.js';
import modelProducts from './products.models.js';


mongoose.pluralize(null);

const collection = 'carts';
const db = mongoose.connection.useDb('ecommerce')


const productSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products'}, 
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    // _user_id: { 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'users', 
    //     required: true 
    // },
    
    products: [productSchema]
});

// Middleware de preconsulta para find y findOne
orderSchema.pre('find', function () {
    // this.populate({ path: '_user_id', model: modelUsers });
    this.populate({ path: 'products._id', model: modelProducts });
});

orderSchema.pre('findById', function () {
    // this.populate({ path: '_user_id', model: modelUsers });
    this.populate({ path: 'products._id', model: modelProducts });
});

const modelCarts = db.model(collection, orderSchema);

export default modelCarts;