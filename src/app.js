import express from 'express';
import config from './config.js';
import products from './routes/products.routes.js';
import carts from './routes/carts.routes.js';

//Instancio el framework y la clase
const app = express ();



//parseo de las url:
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

//la redireccion a las rutas:
app.use('/api/products', products);
app.use('/api/carts', carts);

//la parte estatica que se muestra:
// app.use('/', express.static('src/public'));



// //Endpoint con params
// app.get('/products/:pid', async (req,res)=>{
    
//     try{ 
//         const pid= parseInt(req.params.pid);
        
//         const productsId = await PME.getProductById(pid)
        
//         res.send({status:1, payload: productsId})

//     }catch (error){
//         console.error('Error al leer el archivo de productos:', error);
//         res.status(500).send('Error del servidor');
//     }
    
// })

//Escucha
app.listen (config.PORT, ()=>{
    console.log('Servidor activo en puerto 8080')
    console.log(config.DIRNAME)
})