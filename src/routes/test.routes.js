import CustomRouter from "./custom.router.js";

export default class TestRouter extends CustomRouter {
    init(){
        this.get('/', async(req, res) =>{
            res.sendSuccess('Ok desde la clase personalizada!');
        })


        //y vamos creando todos los endpoints que queramos

    }
}