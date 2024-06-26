
import modelProducts from './models/products.models.js';


export class ProductManagerMongoDb {

    createProduct = async(productData) =>  {

        try {
            const product = new modelProducts(productData);
            await product.save();
            return product;
        } catch (error) {
            console.error('Error al crear el producto:', error);
        }

    }

    getAllProducts = async(queryHtml, limitHtml, pageHtml, sortHtml) => {
        try {
            
            // Set options based on arguments

        const options = {

            limit: limitHtml || 10,
            
            page: pageHtml || 1,
            
            };
            
            // Check if queryHtml is defined and not empty
            
            if (!queryHtml || queryHtml.trim() ==='') {
            
            console.warn("queryHtml is undefined or empty, returning all products.");
            
            return modelProducts.paginate({}, options); // Find all products if queryHtml is invalid
            
            }
            
            // Valida formato queryHtml
            
            if (validateQueryHtmlFormat && !validateQueryHtmlFormat(queryHtml)) {
            
            console.error('Invalid queryHtml format');
            
            // en caso de no ser valido el formato
            
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
            
            return products;
            
            } catch (error) {
            
            console.error('Error al obtener los productos:', error);
            
            if (error.name === 'ValidationError') {
            
            console.error('Validation errors:', error.errors);
            
            }
            
            return { error: error.message };
            
            }
            
            };
    //         const options = {
    //                 limit : limitHtml || 10,
    //                 page : pageHtml || 1                    
    //             }

    //             if(sortHtml === -1 || sortHtml === 1){
    //                 options.sort = {price: sortHtml}
    //             }                

    //             let queryFilter = JSON.parse(queryHtml) 

    //         const products = await modelProducts.paginate(queryFilter, options);
    //         return products;
    //     } catch (error) {
    //         console.error('Error al obtener los productos:', error);
    //     }
    // }

    getProductById = async (productId) => {
        try {
            const product = await modelProducts.findById(productId);
            return product;
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error);
        }
    }
    
    updateProduct = async (productId, updates) => {
        try {
            const product = await modelProducts.findByIdAndUpdate(productId, updates, { new: true });
            return product;
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    }

    deleteProduct = async (productId) => {
        try {
            await modelProducts.findByIdAndDelete(productId);
            console.log('Producto eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    }






}