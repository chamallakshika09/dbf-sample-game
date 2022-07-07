const httpStatus = require('http-status');
const { getState } = require('../sockets');

const getStateFromSocket = (req, res, next) => {
  const state = getState();
  return res.status(httpStatus.OK).json(state);
};

module.exports = {
  getStateFromSocket,
};
