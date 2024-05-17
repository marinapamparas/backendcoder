import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'messages';
const db = mongoose.connection.useDb('ecommerce')

const schema = new mongoose.Schema({
    user: {type: String, required: true}, 
    message: {type: String, required: true}
});

const modelMessages = db.model(collection, schema);

export default modelMessages;