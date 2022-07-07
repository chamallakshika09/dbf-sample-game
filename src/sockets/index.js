const { Server } = require('socket.io');
// const AMMO = require('ammo.js');

const { UPDATE_STATE, BROADCAST_UPDATED_STATE, SEND_INITIAL_STATE } = require('../constants');

const SOCKET_IO = 'socketIO';

let socketIO;

let clients = [];
let state = {
  balls: [],
  ropes: [],
  rigidBodies: [],
};

const getState = () => state;

const socketConnection = async (server) => {
  if (!socketIO && server) {
    socketIO = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
      },
    });

    /** using ammo.js */
    // const ammo = await AMMO();
    // const v1 = new ammo.btVector3(1, 2, 3);
    // console.log(v1);

    socketIO.on('connection', async (socket) => {
      clients.push(socket.id);
      // socket.emit(SEND_INITIAL_STATE, state);

      socket.on(UPDATE_STATE, (updatedState) => {
        state = updatedState;
        socketIO.emit(BROADCAST_UPDATED_STATE, state);
      });

      socket.on('disconnect', async () => {
        clients = clients.filter((c) => c !== socket.id);
      });
    });
  }

  return socketIO;
};

const getSocketInstance = (req) => req.app.get(SOCKET_IO);

module.exports = { socketConnection, SOCKET_IO, getSocketInstance, getState };
