const express = require('express');
const router = express.Router();
const {Show, User} = require('../../../../modules/db');
const checkAdminApi = require('../../../../modules/middlewares').checkAdminApi;

router.delete('/:id(\\d+)', (req, res) => {
    Show.findById(req.params.id).exec()
        .then(async result => {
            if (result) {
                let users = await User.find().exec();
                for (let it of users) {
                    if (it.list.includes(parseInt(req.params.id))) {
                        let arr = it.list;
                        arr.splice(arr.indexOf(parseInt(req.params.id)), 1);
                        await it.update({list: arr}).exec();
                    }
                }
                result.remove().then(() => res.status(200).send({
                    status: "200",
                    message: 'Delete',
                    delShow: result
                }));
            }else
                res.status(404).send({
                    status: "404",
                    message: 'No such Show'
                });
        })
        .catch(error => res.status(500).send({
            status: "500",
            message: `Internal Server Error - ${error}`
        }));
});

module.exports = router;