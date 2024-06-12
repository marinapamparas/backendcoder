import path from 'path';
import * as url from 'url';


const config = {
    PORT : 8080,
    // DIRNAME: url.fileURLToPath(new URL('./src', import.meta.url)),
    // // UPLOAD_DIR: 'public/img' le sumamos el get para poder usar el DIRNAME
    // get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` }

    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },

    //MONGOSDB_URI: 'mongodb+srv://coderbackend:coderbackend@clustercode.eoywkfr.mongodb.net/',
    MONGOSDB_URI: 'mongodb+srv://coderbackend:coderbackend@clustercode.eoywkfr.mongodb.net/',
    SECRET: 'coder_Mar_secret',

    GITHUB_CLIENT_ID: 'Iv23ctgbmXptNKc4qhDl',
    GITHUB_CLIENT_SECRET: '029f78ec725bc1e627c7776f58a6a4a09821c1bf',
    GITHUB_CALLBACK_URL: 'http://localhost:8080/api/sessions/ghlogincallback'

};

export default config