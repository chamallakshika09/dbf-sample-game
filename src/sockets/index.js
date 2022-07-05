const { Server } = require('socket.io');
const AMMO = require('ammo.js');

const { UPDATE_STATE, BROADCAST_UPDATED_STATE } = require('../constants');

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

    /** using ammo.js */
    // const ammo = await AMMO();
    // const v1 = new ammo.btVector3(1, 2, 3);
    // console.log(v1);

    socketIO.on('connection', async (socket) => {
      socket.on(UPDATE_STATE, (msg) => {
        socketIO.emit(BROADCAST_UPDATED_STATE, msg);
      });

      socket.on('disconnect', async () => {});
    });
  }

  return socketIO;
};

const getSocketInstance = (req) => req.app.get(SOCKET_IO);

module.exports = { socketConnection, SOCKET_IO, getSocketInstance };
