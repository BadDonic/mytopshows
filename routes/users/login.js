const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    if (req.user) res.redirect('/');
    res.render('login', {
        name: "Login",
    });
});

router.post('/', (req, res, next) => {
    passport.authenticate('login', (err, user) => {
        if (!user)
            return res.render('login', {
            name: "Login",
            error: err,
            username: user ? user.username : undefined,
        });
        req.logIn(user, err => {
            if (err) return res.render('login', {
                name: "Login",
                error: err,
                username: user.username,
            });
            res.redirect('/');
        });
    })(req, res, next)
});

module.exports = router;