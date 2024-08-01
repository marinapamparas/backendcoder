import { Router } from "express";
import config from "../config.js";



const test = Router();




test.get('/loggerTest', async (req, res) => {

    try{
        req.logger.debug('Este es un mensaje debug');
        req.logger.http('Este es un mensaje http');
        req.logger.info('Este es un mensaje info');
        req.logger.warning('Este es un mensaje warning');
        req.logger.error('Este es un mensaje error');
        req.logger.fatal('Este es un mensaje fatal');

        res.send({payload: 'Prueba de logs realizada'});
    }catch(error){
        req.logger.error('Error al realizar las pruebas de logs')
        res.status(500).send('Error al realizar las pruebas de logs')
    }
    
})



export default test;