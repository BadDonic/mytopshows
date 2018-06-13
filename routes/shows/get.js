const express = require('express');
const router = express.Router();
const Show = require('../../modules/db').Show;
const { checkAuth } = require('./../../modules/middlewares');
const pageSize = 3;

router.get('/',
    checkAuth,
    async (req, res) => {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let searchedText = req.query.search ? req.query.search.toLowerCase() : "";
        let regExp = new RegExp(searchedText, 'i');
        let next = false;

        let result = await Promise.all([
            Show.find({name: {$regex: regExp}}).skip(pageSize * (page - 1)).limit(pageSize + 1),
            Show.find().sort([['views', -1]]).exec()
        ]).catch(() => res.render('error', {
            name: '500',
            user: req.user,
        }));

        if (result[0].length === pageSize + 1) {
            next = true;
            result[0].pop();
        }

        res.render('shows', {
            name: "Shows",
            user: req.user,
            list: result[1],
            searchedList: result[0],
            page: page,
            pageSize: pageSize,
            searchedText: req.query.search,
            next: next
        });
    });

router.get('/:id(\\d+)',
    checkAuth,
    async (req, res) => {
        let result = await Promise.all([
            Show.findById(req.params.id),
            Show.find().sort([['views', -1]]).exec(),
        ]).catch(() => res.render('error', {
            name: '500',
            user: req.user,
        }));
        if (!result[0])
            res.render('error', {
                name: '404',
                user: req.user,
            });
        let views = result[0].views;
        await result[0].update({views: views + 1});
        res.render('show', {
            name: result[0].name,
            user: req.user,
            show: result[0],
            list: result[1]
        });
    });

module.exports = router;