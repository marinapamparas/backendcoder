import modelCarts from "../../models/carts.models.js";


class CartsService {
    constructor() {
    }

    add = async() => {
        try {
            const cart = new modelCarts();
            
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
        }
    }

    addProduct = async (cid, pid) => {
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
                // Verificar si el producto ya está en el carrito
                const existingProduct = cartExists.products.find(item => item._id.toString() === pid);
                
                if (existingProduct) {
                    // Si el producto ya existe, incrementar la cantidad
                    existingProduct.quantity++;
                    console.log("Quantity incremented to product successfully");
                } else {
                    // Si el producto no existe, agregarlo al carrito
                    cartExists.products.push({ _id: pid, quantity: 1 });
                    console.log("Product added to cart successfully");
                }

                // Guardar el carrito actualizado en la base de datos
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
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
                const existingProduct = cartExists.products.find(item => item.id === pid);

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
            console.error('Error updating quantity of product:', error);
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
                const existingProduct = cartExists.products.find(item => item.id === pid);

                if (existingProduct) {
                    existingProduct.deleteOne()
                }    
                // Guardar el carrito actualizado en la base de datos
                await cartExists.save();
            } else {
                console.log('The cart does not exist');
            }
        } catch (error) {
            console.error('Error deleting the product:', error);
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
            console.error('Error deleting the product:', error);
        }
    }

    getOne = async(cartId) =>{
        try {
            const cart = await modelCarts
            .findById(cartId)
            // .populate({path: 'products._id', model: modelProducts}); - ya lo tengo automatizado en modelcarts
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito por ID:', error);
        }
    }

}

export default CartsService;