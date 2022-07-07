const express = require('express');
const stateRoute = require('./state.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/state',
    route: stateRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
