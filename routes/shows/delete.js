const express = require('express');
const router = express.Router();
const Show = require('../../modules/db').Show;
const checkAdmin = require('./../../modules/middlewares').checkAdmin;

router.post('/:id(\\d+)',
    checkAdmin,
    async (req, res) => {
        let result = await Show.findById(req.params.id).exec()
            .catch(() => res.render('error', {
                name: '500',
                user: req.user,
            }));
        if (!result)
            res.render('error', {
                name: '404',
                user: req.user,
            });
        result.remove();
        res.redirect('/');
});

module.exports = router;