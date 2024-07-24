import ProductsService from "../services/dao/products.dao.mdb.js";


const service = new ProductsService();

class ProductsDTO {
    constructor(product) {
        this.product = product;
        //this.product.title = this.product.title.toUpperCase();
    }
}

class ProductsManager {
    constructor() {
    }

    getOne = async (filter) => {
        try {
            return await service.getOne(filter);
        } catch (err) {
            return err.message;
        };
    };

    getPaginated = async (queryHtml, limitHtml, pageHtml, sortHtml) => {
        try {
            return await service.getPaginated(queryHtml, limitHtml, pageHtml, sortHtml);
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {
        try {
            const normalizedData = new ProductsDTO(newData);
            return await service.add(normalizedData.product);
        } catch (err) {
            return err.message;
        };
    };

    update = async (productId, updates, options) => {
        try {
            return await service.update(productId, updates, options);
        } catch (err) {
            return err.message;
        };
    };

    delete = async (filter) => {
        try {
            return await service.delete(filter);
        } catch (err) {
            return err.message;
        };
    };
}

export default ProductsManager;