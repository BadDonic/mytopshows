const express = require('express');
const fs = require("fs-extra");
const router = express.Router();
const {Show, uploadImage, uploadVideo} = require('../../modules/db');
const checkAdmin = require('./../../modules/middlewares').checkAdmin;

router.get(`/:id(\\d+)`,
    checkAdmin,
    async (req, res) => {
        let result = await Promise.all([
            Show.find().sort([['views', -1]]).exec(),
            fs.readJson(__dirname + "/../../data/countries.json"),
            fs.readJson(__dirname + "/../../data/genres.json"),
            Show.findById(req.params.id).lean().exec()
        ]).catch(() => res.render('error', {
            name: '500',
            user: req.user,
        }));
        if (!result[3])
            res.render('error', {
                name: '404',
                user: req.user,
            });
        let dates = result[3].dateRelease.toString();
        let year = dates.substr(0,4);
        let month = dates.substr(4,2);
        let day = dates.substr(6,2);
        result[3].dateRelease = `${year}-${month}-${day}`;
        res.render(`add`, {
            name: result[3].name,
            user: req.user,
            list: result[0],
            countries: result[1],
            genres: result[2],
            show: result[3]
        });
    });

router.post('/:id(\\d+)', checkAdmin, async (req, res) => {
    let imageStr = (!req.files.image || !req.files.image.name.match(/\.(png|jpe?g|gif)$/i)) ? undefined : req.files.image.data.toString('base64');
    let videoStr = (!req.files.video) ? undefined : req.files.video.data.toString('base64');

    let result = await Promise.all([
        Show.find(),
        fs.readJson(__dirname + "/../../data/countries.json"),
        fs.readJson(__dirname + "/../../data/genres.json"),
        Show.findById(req.params.id).exec()
    ]).catch(() => res.render('error', {
        name: '500',
        user: req.user,
    }));
    if (!result[3])
        res.render('error', {
            name: '404',
            user: req.user,
        });

    let updateFields = {
        name: req.body.name,
        genre: req.body.genre,
        country: req.body.country,
        ratingIMDB: req.body.ratingIMDB,
        duration: req.body.duration,
        dateRelease: req.body.dateRelease,
        description: req.body.description,
        image: (!imageStr) ? result[3].image : await uploadImage(imageStr, req.params.id),
        video: (!videoStr) ? result[3].video : await uploadVideo(videoStr, req.params.id)
    };

    await Show.findByIdAndUpdate(req.params.id, updateFields,{ runValidators: true }).exec().then(async () => res.redirect(`/shows/${req.params.id}`))
        .catch(async err => {
            console.log(err);
            let fields = ['name', 'genre', 'country', 'ratingIMDB', 'duration', 'dateRelease', 'description','image', 'video'];
            let errors = [];
            if (err.code === 11000) {
                let {_id} = await Show.findOne({name: req.body.name},'_id').exec();
                errors.push(`Show already exist! - link: ${path}/${_id}`);
            }else if (err.name === 'CastError') {
                errors.push(err.message);
            }
            else {
                for (let it of fields)
                    if (err.errors[it]) errors.push(err.errors[it].message);
            }
            res.render(`add`, {
                name: result[3].name,
                user: req.user,
                list: result[0],
                countries: result[1],
                genres: result[2],
                show: result[3],
                error: errors[0]
            });
        });

});

module.exports = router;