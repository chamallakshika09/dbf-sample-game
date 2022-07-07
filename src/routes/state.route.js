const express = require('express');
const stateController = require('../controllers/state.controller');

const router = express.Router();

router.route('/').get(stateController.getStateFromSocket);

module.exports = router;
