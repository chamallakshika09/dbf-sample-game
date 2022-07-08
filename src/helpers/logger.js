const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const { combine, colorize, label, printf, json, timestamp } = format;

const logFormat = combine(
  timestamp(),
  json(),
  colorize(),
  label({ label: '[GAME-API]' }),
  printf(
    ({ timestamp: Timestamp, label: Label, level, message, ...info }) =>
      `${Timestamp} ${chalk.cyan(Label)} ${level} : ${message} : ${JSON.stringify({ ...info })}`
  )
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [new transports.Console({})],
  format: logFormat,
  exitOnError: false,
});
// const logger = require('firebase-functions/lib/logger');

module.exports = logger;
