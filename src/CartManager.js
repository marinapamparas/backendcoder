import fs from 'fs';


export class CartManager{
    constructor(fileName){
        this.path = "./storage/";
        this.fileName = fileName;
        this.fullPath = this.path + this.fileName;
        this.carts = [];
        this.cartsReadFile = [];
        this.lastId = 0
        this.quantity = 1
    }

    readFile = async () => {
        //Lectura de archivo
        const content = await fs.promises.readFile(this.fullPath, { encoding: 'utf-8' });
        
        //Parseo de string a tipo objeto

        if (!content.trim()) {
            console.log('El archivo está vacío');
            this.cartsReadFile = [];
            return;
        }

        const jsonContent = await JSON.parse(content)
        
        //Asignación del objeto a mi array cartsReadFile
        this.cartsReadFile = jsonContent  

        return
        
    }

    writeFile = async() => {        
        //Conversión de tipo objeto a tipo string de mis productos
        let productosString = JSON.stringify(this.carts, null, 2)

        //Escritura de archivo
        await fs.promises.writeFile (this.fullPath, productosString);      
         
        return
    }

    createCart = async() =>  {

        const newCart = {
            id: ++this.lastId,
            products: []
        };
       
        this.carts.push(newCart);
       

        await this.writeFile()
        return;
    }

    addProduct = async(cid, pid) =>  {
        //validaciones
        if (!cid || !pid) {
            console.error("All fields are mandatory");
            return;
        }
        if(cid < 0 || pid < 0){
            console.error("The id is not valid")
            return;
        }

        const cartExists = await this.getCartById(cid) 

        if (cartExists !== undefined){
            
            if (cartExists.products !== undefined && cartExists.products !== null && cartExists.products.length > 0){
                
                const existingProduct = cartExists.products.find(item => item.id === pid);

                if (existingProduct) {
                
                    existingProduct.quantity++;

                } else {
                    
                    const newProduct = {
                        id: pid,
                        quantity: 1
                    };
                    cartExists.products.push(newProduct);
                }
            }else{
                const newProduct = {
                    id: pid,
                    quantity: 1
                };
               
                cartExists.products.push(newProduct);
            }
                        
            const index = this.cartsReadFile.findIndex(x => x.id === cid)            
            this.cartsReadFile[index] = cartExists

            this.carts = this.cartsReadFile
            await this.writeFile()   

        }else{
            console.log ('The cart doesnt exist')
        }
    }


    getCartById = async(cid) => {
        
        await this.readFile()
        
        const cart = this.cartsReadFile.find(cart => cart.id === cid);
        
        if (!cart) {
            console.error("The cart doesn't exists");
            return;
        }
        
        return cart;
    }

}

// const C = new CartManager('Carts.json');

//  await C.createCart()
//  await C.createCart()
// await C.createCart()
// await C.createCart()

// await C.addProduct (1, 1)
// await C.addProduct (1, 2)



