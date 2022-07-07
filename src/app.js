require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { NODE_ENV } = require('./config');
const routes = require('./routes');

// const formidableMiddleware = require('express-formidable');

const app = express();

app.use(morgan('dev'));

app.set('trust proxy', true);

// parse body params and attache them to req.body
app.use(
  express.json({
    // limit: '100mb',
    // verify: (req, res, buf) => {
    //   if (req.originalUrl.indexOf('/webhook') !== -1) {
    //     req.rawBody = buf.toString();
    //   }
    // },
  })
);

// app.use(formidableMiddleware());

app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));

// TODO:
// Disable gzip compression if not needed or use something like nginx to compress
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

// if (NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, '../client/build')));

// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// }

app.use('/api/v1', routes);

module.exports = app;
