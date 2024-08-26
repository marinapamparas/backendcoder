import chai from "chai";
import supertest from "supertest";

const expect = chai.expect; //para poder usar chai
const requester = supertest('http://localhost:8080'); //para poder hacer las solicitudes a los endpoints
const testProduct = {title: "Papel Higienico", description: "Papel para el baño", price: 500, code: 5496, stock: 10, status: true, category: "Limpieza", owner: "marpamparas@gmail.com"};
let cookie;



describe('Test de integración Products', function () {
    it('', async function () {

    });

    it('', async function () {

    });

    it('', async function () {

    });

    it('', async function () {

    });

    it('', async function () {

    });

}
)
