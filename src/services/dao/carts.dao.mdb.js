import { errorsDictionary } from "../../config.js";
import modelCarts from "../../models/carts.models.js";
import modelProducts from '../../models/products.models.js';
import modelTickets from "../../models/ticket.models.js";
import CustomError from "../CustomError.class.js";
import ProductsService from "./products.dao.mdb.js";
import TicketsService from "./ticket.dao.mdb.js";



const ticketsDao = new TicketsService();
const productsDao = new ProductsService();

class CartsService {
    constructor() {
    }

    add = async() => {
        try {
            const cart = new modelCarts();
            
            await cart.save();
            return cart;
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_CREATION_ERROR)
        }
    }

    addProduct = async (cid, pid) => {
        // Validaciones
        if (!cid || !pid) {
            throw new CustomError(errorsDictionary.FEW_PARAMETERS)
            // console.error("All fields are mandatory");
            // return;
        }
        if (cid < 0 || pid < 0) {
            throw new CustomError(errorsDictionary.INVALID_PARAMETER)
            //  console.error("The id is not valid")
            //  return;
        }

        try {
            // Buscar el carrito por su ID
            const cartExists = await modelCarts.findById(cid);

            if (cartExists) {
                // Verificar si el producto ya está en el carrito
                const existingProduct = cartExists.products.find(item => item._id.toString() === pid);
                
                if (existingProduct) {
                    // Si el producto ya existe, incrementar la cantidad
                    existingProduct.quantity++;
                    console.log("Quantity incremented to product successfully");
                } else {
                    // Si el producto no existe, chequear que sea real y después agregarlo al carrito

                    const productDB = await productsDao.getOne(pid)
                        if(productDB){
                            cartExists.products.push({ _id: pid, quantity: 1 });
                            console.log("Product added to cart successfully");
                        }else{
                            return;
                        }
                }

                // Guardar el carrito actualizado en la base de datos
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_UPDATE_ERROR)
        }
    };

    updateProduct = async (cid, pid, qty) => {
        // Validaciones
        if (!cid || !pid) {
            console.error("All fields are mandatory");
            return;
        }
        if (cid < 0 || pid < 0) {
            console.error("The id is not valid")
            return;
        }
        if(qty < 0){
            console.error("The quantity must be more than one")
        }

        try {
            // Buscar el carrito por su ID
            const cartExists = await modelCarts.findById(cid);

            if (cartExists) {
                // Verificar si el producto ya está en el carrito
                const existingProduct = cartExists.products.find(item => item._id.equals(pid));

                if (existingProduct) {
                    // Si el producto ya existe, actualizar la cantidad
                    existingProduct.quantity = qty;
                    console.log("Quantity updated in product successfully");
                } 

                // Guardar el carrito actualizado en la base de datos
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_UPDATE_ERROR)
        }
    }

    deleteProduct = async (cid, pid) => {
        // Validaciones
        if (!cid || !pid) {
            console.error("All fields are mandatory");
            return;
        }
        if (cid < 0 || pid < 0) {
            console.error("The id is not valid")
            return;
        }

        try {
            // Buscar el carrito por su ID
            const cartExists = await modelCarts.findById(cid);
            
            if (cartExists) {
                // Verificar si el producto está en el carrito
                const existingProduct = cartExists.products.find(item => item._id.equals(pid));                

                if (existingProduct) {
                    existingProduct.deleteOne()                    
                }    
                // Guardar el carrito actualizado en la base de datos
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_DELETE_ERROR)
        }
    }

    deleteAllProducts = async (cid) => {
        // Validaciones
        if (!cid) {
            console.error("All fields are mandatory");
            return;
        }
        if (cid < 0) {
            console.error("The id is not valid")
            return;
        }

        try {
            // Buscar el carrito por su ID
            const cartExists = await modelCarts.findById(cid);

            if (cartExists) {
                
                cartExists.products = [];
                
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            throw new CustomError(errorsDictionary.RECORD_DELETE_ERROR)
        }
    }

    getOne = async(cartId) =>{
        try {
            const cart = await modelCarts
            .findById(cartId)
            .populate({path: 'products._id', model: modelProducts}); //- ya lo tengo automatizado en modelcarts
            
            return cart;
        } catch (error) {
            throw new CustomError(errorsDictionary.INVALID_PARAMETER)
        }
    }

    validationPurchase = async(cid, user) => {
        const cart = await this.getOne(cid) //obtengo el carrito en base al id que me dan
        const userData = user
       
        
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        let ticketAmount = 0

        for (let item of cart.products) {
            const productStock = item._id.stock;
            const requestedQuantity = item.quantity;
            
            //si me alcanza el stock
            if(requestedQuantity <= productStock){
                //modifico la cantidad restante del producto en mi db
                const quantityUpdated =  productStock - requestedQuantity
                
                await productsDao.update(item._id._id, {"stock" : quantityUpdated}, {new : true})

                //borrar el producto del carrito
                await this.deleteProduct(cid, item._id._id)

                //generar el ticket de compra
                ticketAmount = ticketAmount + (requestedQuantity*item._id.price)

            }
            
            if (requestedQuantity > productStock) {
                //modifico stock del producto
                await productsDao.update(item._id._id, {"stock" : 0}, {new : true})
                
                //en el carrito dejo la cantidad que no pudo comprar
                const quantityNotPurchased = requestedQuantity - productStock
                await this.updateProduct(cid, item._id._id, quantityNotPurchased)

                //generar el ticket con la cantidad que si compre
                ticketAmount = ticketAmount + (productStock*item._id.price)
            }
            
        }

        if(ticketAmount > 0){
            const ticket = {
                amount : ticketAmount,
                purchaser : userData.email 
            }
            const ticketFinished = await ticketsDao.add(ticket)
            console.log('ticketFinished:', ticketFinished)
            return ticketFinished
        }

        return null;
            

    }
}

export default CartsService;