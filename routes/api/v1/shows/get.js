const express = require('express');
const router = express.Router();
const Show = require('../../../../modules/db').Show;
const checkAuthApi = require('../../../../modules/middlewares').checkAuthApi;
const pageSize = 3;
const path = 'http://localhost:3000/api/v1/shows';

router.get('/', async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    if (page < 1) res.status(404).send({
        status: "404",
        message: 'No such page'
    });
    const search = req.query.search ? req.query.search.toLowerCase() : "";
    let regExp = new RegExp(search, 'i');
    let result = await Promise.all([
        Show.find({name: {$regex: regExp}}).lean().skip(pageSize * (page - 1)).limit(pageSize),
        Show.count({name: {$regex: regExp}}).exec()
    ]).catch(error => res.status(500).send({
        status: "500",
        message: `Internal Server Error - ${error}`
    }));
    let totalPages = Math.ceil(result[1] / pageSize);
    if (totalPages === 0) {
        res.status(404).send({
            status: "404",
            message: 'No such Shows'
        });
    }else if (page >= 1 && page <= totalPages) {
        result[0].forEach(item => item._self = `${path}/${item._id}`);
        res.status(200).send({
            shows: result[0],
            pageSize,
            totalPages,
            page,
            prev: (page !== 1) ? `${path}?page=${page - 1}&search=${search}` : null,
            next: (page !== totalPages) ? `${path}?page=${page + 1}&search=${search}` : null,
            search: req.query.search
        });
    }else
        res.status(404).send({
            status: "404",
            message: 'No such page'
        });
});

router.get('/:id(\\d+)', async (req, res) => {
    const id = req.params.id ? req.params.id : 1;
    if (id < 1) res.status(404).send({
        status: "404",
        message: 'No such Show - Invalid Id'
    });
    let show = await Show.findById(id).exec()
        .catch(error => res.status(500).send({
            status: "500",
            message: `Internal Server Error - ${error}`
        }));
    if (show)
        res.status(200).send(show);
    else
        res.status(404).send({
            status: "404",
            message: 'No such Show'
        });
});

module.exports = router;