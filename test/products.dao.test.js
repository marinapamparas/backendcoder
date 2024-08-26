import * as chai from 'chai';
import mongoose from 'mongoose';
import config from '../src/config.js';
import ProductsService from '../src/services/dao/products.dao.mdb.js';

const expect = chai.expect; //para poder usar chai
const dao = new ProductsService();
const connection  = await mongoose.connect(config.MONGODB_URI);
const testProduct = {_id: "66437f673e4d32f3df08752e", title: "Papel Higienico", description: "Papel para el baño", price: 500, code: 5496, stock: 10, status: true, category: "Limpieza", owner: "marpamparas@gmail.com"};




describe('Test Unitario DAO Products', async function () {

    before(async function () {
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose connection is not ready.');
            return;
            }
        
            // Seleccionar la base de datos 'ecommerce'
            const db = mongoose.connection.useDb('ecommerce');
          
            // Obtener la colección 'users_test'
            const collection = db.collection('products_test');
          
            try {
                // Intenta eliminar la colección
                await collection.drop();
                console.log('Collection dropped successfully.');
            } catch (err) {
            // Verifica si la colección no existe
            if (err.codeName === 'NamespaceNotFound') {
              console.log('Collection does not exist, nothing to drop.');
            } else {
              console.error('Error dropping collection:', err);
              throw err;
            }
        }
    });

    this.timeout(5000);



    it('add() debe retornar un objeto con los datos del nuevo usuario', async function () {

        const result = await dao.add(testProduct)

        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(result).to.have.property('title');
        expect(result).to.have.property('description');
        expect(result).to.have.property('price');
        expect(result).to.have.property('code');
        expect(result).to.have.property('category');
        expect(result).to.have.property('status');

    });

    it('getOne() debe retornar un objeto coincidente con el criterio indicado', async function () {
        const result = await dao.getOne({_id : testProduct._id})

        const productId = result._id.toString()

        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(productId).to.be.equals(testProduct._id);

    });

    

    it('getPaginated() debe retornar un listado de objetos y toda la paginación', async function () {
        
        const queryHtml = {};        
        const limitHtml = 5;
        const pageHtml = 2;
        const sortHtml = '';

        const result = await dao.getPaginated(queryHtml, limitHtml, pageHtml, sortHtml);

        expect(result).to.be.an('object');
        expect(result).to.have.property('docs');
        expect(result).to.have.property('totalPages');
        expect(result).to.have.property('page');
        expect(result).to.have.property('limit');


    });

    it('update() debe retornar un objeto con los datos modificados', async function () {
       
        const productId = testProduct._id
        const update = { title: "Servilletas" }
        const updateTest = "Servilletas"
        const options = {new : true}; 
        const result = await dao.update(productId, update, options)

        
        expect(result).to.be.an('object');
        expect(result._id).to.be.not.null;
        expect(result.title).to.be.equals(updateTest);

    });

    it('delete() debe borrar definitivamente el documento indicado', async function () {
        
        const result = await dao.delete(testProduct._id);
        const productId = result._id.toString()

        expect(result).to.be.an('object');
        expect(productId).to.be.deep.equal(testProduct._id);

    });
    
}
)
