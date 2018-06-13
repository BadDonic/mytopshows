const express = require('express');
const router = express.Router();

router.use('/shows', require('./shows'));
router.use('/users', require('./users'));

module.exports = router;