const express = require('express');
const router = express.Router();

router.use('/', require('./add'));
router.use('/', require('./get'));
router.use('/', require('./delete'));
router.use('/', require('./update'));

module.exports = router;