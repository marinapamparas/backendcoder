import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);

const collection = 'products';
const db = mongoose.connection.useDb('ecommerce')
const schema = new mongoose.Schema({

    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: [String]},
    code: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    status: { type: Boolean, required: true },
    category: { type: String, required: true },
    owner: { type: String, default: "ADMIN" }

});

schema.plugin(mongoosePaginate);

const modelProducts = db.model(collection, schema);

export default modelProducts;