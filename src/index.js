require('dotenv').config();

const http = require('http');

const logger = require('./helpers/logger');

const app = require('./app');

const { socketConnection, SOCKET_IO } = require('./sockets');

const { PORT, NODE_ENV } = require('./config');

let server;

const gracefulStopServer = () => {
  logger.info('SIGTERM/SIGINT signal received: closing HTTP server');
  // Wait for existing connection to close and then exit.
  server.close(() => {
    logger.info('Shutting down REST API');
    process.exit(0);
  });
};

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION!', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION!', err);
  process.exit(1);
});

process.on('SIGINT', gracefulStopServer);
process.on('SIGTERM', gracefulStopServer);

const main = async () => {
  try {
    logger.info(`REST API is starting`);

    server = http.createServer(app);

    // Init sockets
    const socketIO = await socketConnection(server);
    app.set(SOCKET_IO, socketIO);

    server.listen(PORT, () => {
      logger.info(`REST API is listening on ${PORT} - env ${NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Error occured while DBF REST API is starting', error);
    process.exit(1);
  }
};

main();
