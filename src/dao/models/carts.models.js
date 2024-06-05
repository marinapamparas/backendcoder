import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';
const db = mongoose.connection.useDb('ecommerce')


const productSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'products'}, 
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    _user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    products: [productSchema]
});



const modelCarts = db.model(collection, orderSchema);

export default modelCarts;