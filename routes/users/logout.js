const express = require('express');
const checkAuth = require("../../modules/middlewares").checkAuth;
const router = express.Router();

router.get('/',
    checkAuth,
    (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;