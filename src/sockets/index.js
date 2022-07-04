const { Server } = require('socket.io');

const SOCKET_IO = 'socketIO';

let socketIO;

const socketConnection = async (server) => {
  if (!socketIO && server) {
    socketIO = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
      },
    });

    socketIO.on('connection', async (socket) => {
      socket.on('disconnect', async () => {});
    });
  }

  return socketIO;
};

const getSocketInstance = (req) => req.app.get(SOCKET_IO);

module.exports = { socketConnection, SOCKET_IO, getSocketInstance };
