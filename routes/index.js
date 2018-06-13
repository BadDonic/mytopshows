const express = require('express');
const router = express.Router();
const Show = require("./../modules/db").Show;

router.use('/shows', require('./shows'));
router.use('/users', require('./users'));
router.use('/api', require('./api'));

router.get('/', async (req, res) => {
    let list = await Show.find().sort([['views', -1]]).exec().catch(() => res.render('error', {
        name: '500',
        user: req.user
    }));

    res.render(`index`, {
        name: "Home",
        user: req.user,
        list: list
    });
});

module.exports = router;