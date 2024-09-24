import winston from 'winston';

import config from '../config.js';

const customLevelOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warning: 'yellow',
        info: 'blue',
        http: 'black',
        debug: 'white' 
    }
}
//muestra desde debug hacia arriba
const devLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({ level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
         })
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({ level: 'info',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
         }),
        //Tambien estaba guardando por file, pero el deploy se me rompia si lo dejaba, asique lo tuve que comentar y dejarlo solo por consola.
        // new winston.transports.File({ level: 'http', filename: `${config.DIRNAME}/logs/errors.log`})
    ]
});



export const logger = config.MODE === "dev" ? devLogger : prodLogger;

export const addLogger = (req, res, next) => {
	req.logger = logger;
	req.logger.http(`Method ${req.method} - ${req.url}`);
	next();
};


// export default addLogger;