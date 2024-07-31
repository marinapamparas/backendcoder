import config, { errorsDictionary } from "../config.js";


// const errorsHandler = (error, req, res, next) => {
//     let customErr = errorsDictionary.UNHANDLED_ERROR;  // Default error

//     if (error && error.type && error.type.code !== undefined) {
//         for (const key in errorsDictionary) {
//             if (errorsDictionary[key].code === error.type.code) {
//                 customErr = errorsDictionary[key];
//                 break;  // Exit the loop once the error is found
//             }
//         }
//     }

//     // Ensure customErr has a status
//     if (!customErr.status) {
//         customErr = errorsDictionary.UNHANDLED_ERROR;
//     }

//     return res.status(customErr.status).send({ origin: config.SERVER, payload: '', error: customErr.message });
// }

// export default errorsHandler;

const errorsHandler = (error, req, res, next) => {
    
    let customErr = errorsDictionary[0];
    for (const key in errorsDictionary) {
        if (errorsDictionary[key].code === error.type.code) customErr = errorsDictionary[key];
    }
    
    return res.status(customErr.status).send({ origin: config.SERVER, payload: '', error: customErr.message });
}

export default errorsHandler;