'use strict';

const logDir = './logs';

let fs = require( 'fs' );
if ( !fs.existsSync( logDir ) ) {
    // Create the directory if it does not exist
    fs.mkdirSync( logDir );
}

let winston = require('winston');
winston.emitErrs = true;

let logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: logDir + '/all-logs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false,
      timestamp:true
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp:true
    })
  ],
  exitOnError: false
});

module.exports = logger;
