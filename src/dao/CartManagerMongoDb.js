import modelCarts from "./models/carts.models.js";


export class CartManagerMongoDb{
    


    createCart = async() => {
        try {
            const cart = new modelCarts();
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al crear el producto:', error);
        }
    }



    // addProduct = async(cid, pid) =>  {
    //     //validaciones
    //     if (!cid || !pid) {
    //         console.error("All fields are mandatory");
    //         return;
    //     }
    //     if(cid < 0 || pid < 0){
    //         console.error("The id is not valid")
    //         return;
    //     }

    //     const cartExists = await this.getCartById(cid) 

    //     if (cartExists !== undefined){
            
    //         if (cartExists.products !== undefined && cartExists.products !== null && cartExists.products.length > 0){
                
    //             const existingProduct = await cartExists.products.findById(pid);

    //             if (existingProduct) {
                
    //                 const updateProduct = {
    //                     quantity: quantity++
    //                 };
    //                 existingProduct.updateOne(pid, updateProduct)

    //             }else {
                    
    //                 const newProduct = {
    //                     id: pid,
    //                     quantity: 1
    //                 };
    //                 cartExists.insertOne(newProduct);
    //             }
    //         }else{
    //             const newProduct = {
    //                 id: pid,
    //                 quantity: 1
    //             };
    //             await cartExists.insertOne(newProduct);
    //         }

    //     }else{
    //         console.log ('The cart doesnt exist')
    //     }
    // }

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
                const existingProduct = cartExists.products.find(item => item.id === pid);

                if (existingProduct) {
                    // Si el producto ya existe, incrementar la cantidad
                    existingProduct.quantity++;
                    console.log("Quantity incremented to product successfully");
                } else {
                    // Si el producto no existe, agregarlo al carrito
                    cartExists.products.push({ quantity: 1 });
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
    }

    getCartById = async(cartId) =>{
        try {
            const cart = await modelCarts.findById(cartId);
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito por ID:', error);
        }
    }
    


}
