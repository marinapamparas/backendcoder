import fs from 'fs';


export class ProductManager {
    constructor(fileName){
        this.products = [];
        this.productsReadFile = [];
        this.lastId = 0;
        this.path = "./storage/";
        this.fileName = fileName;
        this.fullPath = this.path + this.fileName
    }

    

    addProduct = async(title, description, price, thumbnail, code, stock, category) =>  {
        //validaciones
        if (!title || !description || !price || !code || !stock || !category) {
            console.error("All fields are mandatory");
            return;
        }
        
        const codeExists = this.products.some(product => product.code === code);
        if (codeExists) {
            console.error("This code allready exists");
            return;
        }
        
        const newProduct = {
            id: ++this.lastId,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status: true,
            category
        };
       
        this.products.push(newProduct);


        await this.writeFile()
    }
        
    readFile = async () => {
        //Lectura de archivo
        const content = await fs.promises.readFile(this.fullPath, { encoding: 'utf-8' });
        
        //Parseo de string a tipo objeto

        if (!content.trim()) {
            console.log('El archivo está vacío');
            this.productsReadFile = [];
            return;
        }

        const jsonContent = await JSON.parse(content)
        
        //Asignación del objeto a mi array productsReadFile
        this.productsReadFile = jsonContent  

        return
        
    }

    writeFile = async() => {        
        //Conversión de tipo objeto a tipo string de mis productos
        let productosString = JSON.stringify(this.products, null, 2)

        //Escritura de archivo
        await fs.promises.writeFile (this.fullPath, productosString);      
         
        return
    }

    updateProduct = async(id, updateItem) => {        
        //Leo el archivo
        await this.readFile()
        //Encontrar el producto por ID y modificarlo
        const newArray = this.productsReadFile.map(items => {
            if (items.id === id){
            return {
                ...items,
                title: updateItem.title,
                description: updateItem.description,
                price: updateItem.price,
                thumbnail: updateItem.thumbnail,
                code: updateItem.code,
                stock: updateItem.stock,
                category: updateItem.category
            };
            } 
            return items;  
        })
        
        //Reescribir 
        this.products = newArray
        await this.writeFile()
    }

    deleteProductById = async(id) => {        
        //Valido si el producto existe en el array
        const productExists = await this.getProductById(id)
        //Si existe filtro para que me devuelva un nuevo array sin ese producto y sino mensaje en consola
        if (productExists !== null && productExists!== undefined){
            const productFilter = this.productsReadFile.filter(product => product.id !== id);
            
            this.products = productFilter

            await this.writeFile()        
        }
    }

    getProductById = async(id) => {
        
        await this.readFile()
        
        const product = this.productsReadFile.find(product => product.id === id);
        
        if (!product) {
            console.error("The product doesn't exists");
            return;
        }
        
        return product;
    }
    

    getProducts = async () =>{
        await this.readFile()
        return this.productsReadFile;
    }
    
}

//Init Program
//Instancio la clase product manager
//const PMInstanciado = new ProductManager ()



//Agrego productos a mi array y archivo 
// await PMInstanciado.addProduct('Title1', 'Description1', 820, './route', 458, 10)
// await PMInstanciado.addProduct('Title2', 'Description2', 640, './route', 468, 25)
// await PMInstanciado.addProduct('Title3', 'Description3', 360, './route', 478, 20)
// await PMInstanciado.addProduct('Title4', 'Description4', 100, './route', 488, 32)


//Recupero producto por id y lo imprimo:
// const productId = await PMInstanciado.getProductById(2)
// console.log(productId)

//Recupero todos los productos del archivo
// const productsArchivo = await PMInstanciado.getProducts()
// console.log(productsArchivo)


//Eliminar producto por id
// await PMInstanciado.deleteProductById(2)

//Modificar producto por id, update
// const productUpdated = {
// title : 'TituloModificado',
// description:'nuevadescripcion',
// price:2,
// thumbnail:'./rutanueva',
// code:111,
// stock:33
// };

// await PMInstanciado.updateProduct(1, productUpdated)

