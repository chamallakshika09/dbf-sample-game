const accessEnv = require('../helpers/access-env');

const data = {
  NODE_ENV: accessEnv('NODE_ENV', null),
  PORT: accessEnv('PORT', null),
  LOG_LEVEL: accessEnv('LOG_LEVEL', null),
};

module.exports = data;
