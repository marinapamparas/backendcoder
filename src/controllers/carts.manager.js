import CartsService from "../services/dao/carts.dao.mdb.js";


const service = new CartsService();

class CartsDTO {
    constructor(cart) {
        this.cart = cart;
    }
}

class CartsManager {
    constructor() {
    }


    add = async (newData) => {
        try {
            const normalizedData = new CartsDTO(newData);
            return await service.add(normalizedData.cart);
        } catch (err) {
            return err.message;
        };
    };

    getOne = async (filter) => {
        try {
            return await service.getOne(filter);
        } catch (err) {
            return err.message;
        };
    };

    addProduct = async (cid, pid) => {
        try {
            return await service.addProduct(cid, pid);
        } catch (err) {
            return err.message;
        };
    };

    updateProduct = async (cid, pid, qty) => {
        try {
            return await service.updateProduct(cid, pid, qty);
        } catch (err) {
            return err.message;
        };
    };

    deleteProduct = async (cid, pid) => {
        try {
            return await service.deleteProduct(cid, pid);
        } catch (err) {
            return err.message;
        };
    };

    deleteAllProducts = async (filter) => {
        try {
            return await service.deleteAllProducts(filter);
        } catch (err) {
            return err.message;
        };
    };

    validationPurchase = async (cid, user) => {
        try {
            return await service.validationPurchase(cid, user);
        } catch (err) {
            return err.message;
        };
    };
}

export default CartsManager;