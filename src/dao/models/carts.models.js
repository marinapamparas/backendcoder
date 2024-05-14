import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';
const db = mongoose.connection.useDb('ecommerce')


const productSchema = new mongoose.Schema({
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    products: [productSchema]
});

const modelCarts = db.model(collection, orderSchema);

export default modelCarts;