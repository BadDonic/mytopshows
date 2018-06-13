const express = require('express');
const router = express.Router();
const User = require('../../modules/db').User;
const checkAdmin = require('./../../modules/middlewares').checkAdmin;

router.post('/:id(\\d+)',
    checkAdmin,
    async (req, res) => {
        let result = await User.findByIdAndRemove(req.params.id).exec()
            .catch(() => res.render('error', {
                name: '500',
                user: req.user,
            }));
        if (!result)
            res.render('error', {
                name: '404',
                user: req.user,
            });
        res.redirect('/users/profile');
    });

module.exports = router;