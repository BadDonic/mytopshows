const express = require('express');
const router = express.Router();
const {User, Show} = require('../../modules/db');
const checkAuth = require("../../modules/middlewares").checkAuth;

router.get('/',
    checkAuth,
    async (req, res) => {
        let shows = [];
        let result = await Promise.all([User.find().exec(), Show.find().sort([['views', -1]]).exec()]).catch(() => res.res.render('error', {
            name: '500',
            user: req.user,
        }));
        for (let it of req.user.list)
        shows.push(await Show.findById(it).exec());

        res.render('profile', {
            name: req.user.username,
            user: req.user,
            list: result[1],
            users: result[0],
            shows
        });
});
router.post('/:id(\\d+)', async (req, res) => {
    req.user.list.forEach(item => {
        if (item === req.params.id) {
            res.sendStatus(422);
        }
    });
    req.user.list.push(parseInt(req.params.id));
    await User.findByIdAndUpdate(req.user._id, {"list": req.user.list}).exec();
    res.status(200).send({
        user: req.user
    });

});
router.delete('/:id(\\d+)', async (req, res) => {
    req.user.list.forEach(item => {
        if (item === req.params.id) {
            res.sendStatus(422);
        }
    });
    req.user.list.splice( req.user.list.indexOf(parseInt(req.params.id)), 1);
    await User.findByIdAndUpdate(req.user._id, {"list": req.user.list}).exec();
    res.status(200).send({
       user: req.user
    });
});
module.exports = router;