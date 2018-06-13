const express = require('express');
const router = express.Router();
const {Show, User} = require('../../../../modules/db');
const checkAdminApi = require('../../../../modules/middlewares').checkAdminApi;

router.delete('/:id(\\d+)', (req, res) => {
    User.findById(req.params.id).exec()
        .then(result => {
            if (result) {
                result.remove().then(() => {
                    res.status(200).send({
                        status: "200",
                        message: 'Delete',
                        delShow: result
                    })
                });
            }else
                res.status(404).send({
                    status: "404",
                    message: 'No such User'
                });
        })
        .catch(error => res.status(500).send({
            status: "500",
            message: `Internal Server Error - ${error}`
        }));
});

module.exports = router;