import path from 'path';
import * as url from 'url';
import { Command } from 'commander';
import dotenv from 'dotenv';


// Parseo de opciones de línea de comandos
const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
    .option('--setup <number>')
commandLine.parse();
const clOptions = commandLine.opts();


//parseo de variables de entorno
dotenv.config({ path: clOptions.mode === 'devel' ? '.env.devel' : '.env.prod' });


const config = {
    PORT : process.env.PORT || clOptions.port || 8080,
    // DIRNAME: url.fileURLToPath(new URL('./src', import.meta.url)),
    // // UPLOAD_DIR: 'public/img' le sumamos el get para poder usar el DIRNAME
    // get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` }
    APP_NAME: 'ecommerce-Marina-Pamparas',
    SERVER: 'atlas_16',
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    
    //MONGOSDB_URI: 'mongodb+srv://coderbackend:coderbackend@clustercode.eoywkfr.mongodb.net/',
    //MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    SECRET: process.env.SECRET,
    
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    PERSISTENCE: process.env.PERSISTENCE || 'mongo',
    GMAIL_APP_USER: process.env.GMAIL_APP_USER,
    GMAIL_APP_PASS: process.env.GMAIL_APP_PASS
};


export const errorsDictionary = {
    UNHANDLED_ERROR: { code: 0, status: 500, message: 'Error no identificado' },
    ROUTING_ERROR: { code: 1, status: 404, message: 'No se encuentra el endpoint solicitado' },
    FEW_PARAMETERS: { code: 2, status: 400, message: 'Faltan parámetros obligatorios o se enviaron vacíos' },
    INVALID_MONGOID_FORMAT: { code: 3, status: 400, message: 'El ID no contiene un formato válido de MongoDB' }, 
    INVALID_PARAMETER: { code: 4, status: 400, message: 'El parámetro ingresado no es válido' },
    INVALID_TYPE_ERROR: { code: 5, status: 400, message: 'No corresponde el tipo de dato' },
    ID_NOT_FOUND: { code: 6, status: 400, message: 'No existe registro con ese ID' },
    PAGE_NOT_FOUND: { code: 7, status: 404, message: 'No se encuentra la página solicitada' },
    DATABASE_ERROR: { code: 8, status: 500, message: 'No se puede conectar a la base de datos' },
    INTERNAL_ERROR: { code: 9, status: 500, message: 'Error interno de ejecución del servidor' },
    RECORD_CREATION_ERROR: { code: 10, status: 500, message: 'Error al intentar crear el registro' },    
    RECORD_CREATION_OK: { code: 11, status: 200, message: 'Registro creado' },
    INVALID_AUTENTICATION: {code:12, status:401, message: 'Usuario no autenticado'},
    INVALID_AUTHORIZATION: {code:13, status:403, message: 'Usuario no autorizado'}
}


export default config