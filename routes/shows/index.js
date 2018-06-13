const express = require('express');
const router = express.Router();

router.use('/add', require('./add'));
router.use('/delete', require('./delete'));
router.use('/update', require('./update'));
router.use('/', require('./get'));

module.exports = router;