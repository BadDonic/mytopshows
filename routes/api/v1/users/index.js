const express = require('express');
const router = express.Router();

router.use('/', require('./delete'));

module.exports = router;