const { Server } = require('socket.io');

const { UPDATE_STATE, BROADCAST_UPDATED_STATE } = require('../constants');
const { getDiff, updateDiff } = require('../utils/stateOps');

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

    socketIO.on('connection', async (socket) => {
      clients.push(socket.id);

      socket.on(UPDATE_STATE, (updatedState) => {
        const diff = getDiff(state, updatedState);

        const updated = updateDiff(state, diff);
        state = updated;
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
