import mongoose from 'mongoose';
import moment from 'moment';

mongoose.pluralize(null);


const generateUniqueCode = () => {
    return Math.random().toString(36).substr(2, 8);
  };

const collection = 'tickets';
const db = mongoose.connection.useDb('ecommerce')
const schema = new mongoose.Schema({

    //_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    code: { type: String, unique: true, default: generateUniqueCode},
    purchase_datetime: {type: Date, default: () => moment().toDate()},
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },

});


schema.pre('save', function (next) {
    this.purchase_datetime = moment().format('DD-MM-YYYY HH:mm:ss');
    next();
});

const modelTickets = db.model(collection, schema);

export default modelTickets;