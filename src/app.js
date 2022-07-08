require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(morgan('dev'));

app.set('trust proxy', true);

// parse body params and attache them to req.body
app.use(express.json());

app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));

// gzip compression
app.use(compression());

// secure apps by setting various HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.use('/api/v1', routes);

module.exports = app;
