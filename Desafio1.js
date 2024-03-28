class ProductManager {
    constructor(){
        this.products = [];
        this.lastId = 0;
    }


    addProduct(title, description, price, thumbnail, code, stock) {
        
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error("All fields are mandatory");
            return;
        }
    
        const codeExists = this.products.some(product => product.code === code);
        if (codeExists) {
            console.error("This ID allready exists");
            return;
        }

        const newProduct = {
            id: ++this.lastId,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(newProduct);

    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            console.error("Product not found");
            return;
        }
        return product;
    }

    getProducts() {
        return this.products;
    }
    
}
