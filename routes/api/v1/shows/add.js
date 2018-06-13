const express = require('express');
const router = express.Router();
const Show = require('../../../../modules/db').Show;
const checkAdminApi = require('../../../../modules/middlewares').checkAdminApi;
const path = 'http://localhost:3000/api/v1/shows';

router.post('/', checkAdminApi, (req, res) => {
    let imageStr = (!req.files.image || !req.files.image.name.match(/\.(png|jpe?g|gif)$/i)) ? undefined : req.files.image.data.toString('base64');

    let show = new Show({
        name: req.body.name,
        genre: req.body.genre,
        country: req.body.country,
        ratingIMDB: req.body.ratingIMDB,
        duration: req.body.duration,
        dateRelease: req.body.dateRelease,
        description: req.body.description,
        image: imageStr,
        views: 0
    });

    show.save()
        .then(() => res.status(201).send({
            status: "201",
            message: 'Created',
            link: `${path}/${show._id}`
        }))
        .catch(async err => {
            let field = ['name', 'genre', 'country', 'ratingIMDB', 'duration', 'dateRelease', 'description','image'];
            let errors = [];

            if (err.code === 11000) {
                let {_id} = await Show.findOne({name: req.body.name},'_id').exec();
                errors.push(`Show already exist! - link: ${path}/${_id}`);
            }else if (err.name === 'CastError') {
                errors.push(err.message);
            }else {
                for (let it of field)
                    if (err.errors[it]) errors.push(err.errors[it].message);
            }
            res.status(422).send({
                status: '422',
                message: 'Incorrect data',
                errors: errors
            });
        });
});

module.exports = router;