import * as chai from 'chai';
import supertest from "supertest";
import mongoose from 'mongoose';
import config from '../src/config.js';



const expect = chai.expect; //para poder usar chai
const requester = supertest('http://localhost:8080'); //para poder hacer las solicitudes a los endpoints
const connection  = await mongoose.connect(config.MONGODB_URI);
const testUser = {firstName: "Isabella", lastName: "Castellanos", email: "isabella@gmail.com", age: 2, password: "abcd"};
const regexTokenFormat = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
let cookie = {};




describe('Test de integración Products', function () {
    
    before(async function () {
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose connection is not ready.');
            return;
            }
        
            // Seleccionar la base de datos 'ecommerce'
            const db = mongoose.connection.useDb('ecommerce');
          
            // Obtener la colección 'users_test'
            const collection = db.collection('users_test');
          
            try {
                // Intenta eliminar la colección
                await collection.drop();
                console.log('Collection dropped successfully.');
            } catch (err) {
            // Verifica si la colección no existe
            if (err.codeName === 'NamespaceNotFound') {
              console.log('Collection does not exist, nothing to drop.');
            } else {
              console.error('Error dropping collection:', err);
              throw err;
            }
        }
    });
        
    this.timeout(5000); // Aumenta el timeout a 5 segundos para todas las pruebas en esta suite

    it('POST /api/auth/jwtregister debe registrar un nuevo usuario', async function () {
       const { _body }  = await requester.post('/api/auth/jwtregister').send(testUser);
    
        expect(_body.error).to.be.undefined;
        expect(_body.payload).to.be.ok; // ok porque me tiene que devolver algo, y si es asi va a estar success
    });

    it('POST /api/auth/jwtregister NO debe volver a registrar el mismo mail', async function () {
        const { statusCode }  = await requester.post('/api/auth/jwtregister').send(testUser);

        expect(statusCode).to.be.equals(302);
    });

    it('POST /api/auth/jwtlogin debe ingresar correctamente al usuario', async function () {
        
        const result  = await requester.post('/api/auth/jwtlogin').send(testUser);
        const cookieData = result.headers['set-cookie'][0];
        
        // Extraer el nombre y el valor de la cookie
        const [name, valueWithExtras] = cookieData.split(';')[0].split('=');
        
        cookie.name = name;
        cookie.value = valueWithExtras.trim();
        
        expect(cookieData).to.be.ok; //es decir que la cookie contenga algo
        expect(cookie.name).to.be.equals('ecommerce-Marina-Pamparas_cookie');
        expect(cookie.value).to.be.ok; //osea que tenga un token
        expect(cookie.value).to.match(regexTokenFormat);
    });

    it('GET /api/auth/current debe retornar datos correctos de usuario', async function () {
        
       

        const { _body } = await requester.get('/api/auth/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
        
        
        expect(_body.payload).to.have.property('firstName');
        expect(_body.payload).to.have.property('lastName');
        expect(_body.payload).to.have.property('age');        
        expect(_body.payload).to.have.property('email').and.to.be.eql(testUser.email);


    });

}
)
