const express = require('express');
const router = express.Router();
const {Show, uploadImage} = require('../../../../modules/db');
const checkAdminApi = require('../../../../modules/middlewares').checkAdminApi;
const path = 'http://localhost:3000/api/v1/shows';

router.put('/:id(\\d+)', checkAdminApi, async (req, res) => {
    let newFields = {};
    let properties = [];
    if(req.body.name) {
        properties.push("name");
        newFields["name"] = req.body.name;
    }
    if(req.body.country) {
        properties.push("country");
        newFields["country"] = req.body.country;
    }
    if (req.body.description) {
        properties.push("description");
        newFields["description"] = req.body.description;
    }
    if (req.body.genre){
        properties.push("genre");
        newFields["genre"] = req.body.genre;
    }
    if (req.body.ratingIMDB) {
        properties.push("ratingIMDB");
        newFields["ratingIMDB"] = parseFloat(req.body.ratingIMDB) || req.body.ratingIMDB;
    }
    if (req.body.duration) {
        properties.push("duration");
        newFields["duration"] = parseInt(req.body.duration) || req.body.duration;
    }
    if (req.body.dateRelease) {
        properties.push("dateRelease");
        newFields["dateRelease"] = req.body.dateRelease;
    }
    if (req.files.image) {
        properties.push('image');
        newFields["image"] = (!req.files.image.name.match(/\.(png|jpe?g|gif)$/i)) ? undefined : await uploadImage(req.files.image.data.toString('base64'),req.params.id);
    }

    if (properties.length === 0) res.status(422).send({
        status: '422',
        message: 'No Such fields',
    });

    Show.findByIdAndUpdate(req.params.id, newFields,  { runValidators: true }).exec()
        .then(async result => {
            if (result) {
                properties.forEach(item => {
                    if (newFields[item] === result[item])
                        delete newFields[item];
                });
                res.status(200).send({
                    status: '200',
                    message: 'Updated',
                    beforeUpdate: result,
                    afterUpdate: newFields,
                    links: `${path}/${req.params.id}`
                });
            }
            else
                res.status(404).send({
                    status: "404",
                    message: 'No such Show'
                });

        })
        .catch(async err => {
            let errors = [];
            if (err.code === 11000) {
                let {_id} = await Show.findOne({name: req.body.name},'_id').exec();
                errors.push(`Show already exist! - link: ${path}/${_id}`);
            }else if (err.name === 'CastError') {
                errors.push(err.message);
            }
            else {
                for (let it of properties)
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