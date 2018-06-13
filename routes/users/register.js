const express = require('express');
const router = express.Router();
const User = require("./../../modules/db").User;

router.get('/', (req, res) => {
    res.render('register', {
        name: "Registration",
    });
});

router.post('/', async (req, res) => {
    req.body.password = (req.body.password === req.body.confirmPassword) ? req.body.password : undefined;

    let user = new User({
        username: req.body.username,
        email: req.body.email,
        list:[],
        passwordHash: req.body.password,
    });

    user.save()
        .then(() => res.redirect('/users/login'))
        .catch(err => {
            let fields = ['username', 'email', 'passwordHash'];
            let errors = [];

            if (err.code === 11000) {
                errors.push("User already exist!");
            }else {
                for (let it of fields)
                    if (err.errors[it]) errors.push(err.errors[it].message);
            }
            res.render('register', {
                name: "Registration",
                error: errors[0],
                username: req.body.username,
                email: req.body.email
            });
        });
});
module.exports = router;