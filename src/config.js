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
dotenv.config();


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
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
    
};


export default config