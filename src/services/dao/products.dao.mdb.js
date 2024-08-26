import modelProducts from '../../models/products.models.js';
import CustomError from '../CustomError.class.js';
import { errorsDictionary } from '../../config.js';

class ProductsService {
    constructor() {
    }

    getOne = async (filter) => {
        try {
            const product = await modelProducts.findById(filter);
            return product;
            
        } catch (error) {          
            
            throw new CustomError(errorsDictionary.ID_NOT_FOUND)
        }
    };

    getPaginated = async (queryHtml, limitHtml, pageHtml, sortHtml) => {
        try {
            
            // Set options based on arguments

            const options = {

            limit: limitHtml || 10,
            
            page: pageHtml || 1,
            
            };
            
            // // Check if queryHtml is defined and not empty
            
            // if (!queryHtml || queryHtml === '') {
            
            // const products = await modelProducts.paginate({}, options);
            
            // return products;
            // // return await modelProducts.paginate({}, options); // Find all products if queryHtml is invalid
            
            // }
            
            
            
            // // Parse queryHtml
            
            // const queryFilter = JSON.parse(queryHtml);
            // Check if queryHtml is defined and not empty
            let queryFilter = {};
            if (typeof queryHtml === 'string' && queryHtml.trim() !== '') {
                // Parse queryHtml if it's a string
                try {
                    queryFilter = JSON.parse(queryHtml);
                } catch (error) {
                    console.error('Invalid JSON format:', queryHtml);
                    throw new CustomError(errorsDictionary.INVALID_SEARCH);
                }
            } else if (typeof queryHtml === 'object' && queryHtml !== null) {
                // Use queryHtml directly if it's an object
                queryFilter = queryHtml;
            }
            
            // Aplicar sort
            
            if (sortHtml === -1 || sortHtml === 1) {
            
            options.sort = { price: sortHtml };
            
            }
            
            //Recuperar productos utilizando paginación y filtro de búsqueda
            
            const products = await modelProducts.paginate(queryFilter, options);
            
            return products;
            
        } catch (error) {
            console.error('Error en getPaginated:', error);
            throw new CustomError(errorsDictionary.INVALID_SEARCH);
        }
            
    };
    

    add = async (newData) => {
        try {
            const product = new modelProducts(newData);
            
            await product.save();
            return product;
        } catch (error) {
            logger.error(error);
            throw new CustomError(errorsDictionary.RECORD_CREATION_ERROR);
        }
    };

    update = async (productId, updates, options) => {
        try {
            const product = await modelProducts.findByIdAndUpdate(productId, updates, options);
            return product;
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_UPDATE_ERROR);
        }
    };

    delete = async (filter) => {
        try {
            const product = await modelProducts.findByIdAndDelete(filter);
            console.log('Producto eliminado correctamente');
            return product;
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_DELETE_ERROR);
        }
    };
}

export default ProductsService;