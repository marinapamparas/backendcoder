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
            //console.error('Error al obtener el producto por ID:', error);
            
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
            
            // Check if queryHtml is defined and not empty
            
            if (!queryHtml || queryHtml.trim() === '') {
            
            const products = await modelProducts.paginate({}, options);
            
            return products;
            // return await modelProducts.paginate({}, options); // Find all products if queryHtml is invalid
            
            }
            
            // // Valida formato queryHtml
            
            if (validateQueryHtmlFormat && !validateQueryHtmlFormat(queryHtml)) {
            
            console.error('Invalid queryHtml format');
            
            //en caso de no ser valido el formato
            
            return;
            
            }
            
            // Parse queryHtml
            
            const queryFilter = JSON.parse(queryHtml);
            
            // Aplicar sort
            
            if (sortHtml === -1 || sortHtml === 1) {
            
            options.sort = { price: sortHtml };
            
            }
            
            //Recuperar productos utilizando paginación y filtro de búsqueda
            
            const products = await modelProducts.paginate(queryFilter, options);
            console.log('products:', products)
            return products;
            
        } catch (error) {
            
            console.error('Error al obtener los productos:', error);
            
            if (error.name === 'ValidationError') {
            
            console.error('Validation errors:', error.errors);
            
            }
            
            return { error: error.message };
            
        }
            
    };
    

    add = async (newData) => {
        try {
            const product = new modelProducts(newData);
            await product.save();
            return product;
        } catch (error) {
            console.error('Error al crear el producto:', error);
        }
    };

    update = async (productId, updates, options) => {
        try {
            const product = await modelProducts.findByIdAndUpdate(productId, updates, options);
            return product;
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    };

    delete = async (filter) => {
        try {
            await modelProducts.findByIdAndDelete(filter);
            console.log('Producto eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    };
}

export default ProductsService;