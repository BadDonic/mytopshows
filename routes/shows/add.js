const express = require('express');
const fs = require("fs-extra");
const router = express.Router();
const Show = require('../../modules/db').Show;
const checkAdmin = require('./../../modules/middlewares').checkAdmin;

router.get(`/`,
    checkAdmin,
    async (req, res) => {
        let result = await Promise.all([
            Show.find().sort([['views', -1]]).exec(),
            fs.readJson(__dirname + "/../../data/countries.json"),
            fs.readJson(__dirname + "/../../data/genres.json")
        ]).catch(() => res.render('error', {
            name: '500',
            user: req.user,
        }));
        res.render(`add`, {
            name: "New Show",
            user: req.user,
            list: result[0],
            countries: result[1],
            genres: result[2]
        });
    });

router.post('/', checkAdmin, async (req, res) => {
    let result = await Promise.all([
        Show.find().sort([['views', -1]]).exec(),
        fs.readJson(__dirname + "/../../data/countries.json"),
        fs.readJson(__dirname + "/../../data/genres.json")
    ]).catch(() => res.render('error', {
        name: '500',
        user: req.user,
    }));
    console.log(req.files);
    let imageStr = (!req.files.image || !req.files.image.name.match(/\.(png|jpe?g|gif)$/i)) ? undefined : req.files.image.data.toString('base64');
    let videoStr = (!req.files.video) ? undefined : req.files.video.data.toString('base64')

    let show = new Show({
        name: req.body.name,
        genre: req.body.genre,
        country: req.body.country,
        ratingIMDB: req.body.ratingIMDB,
        duration: req.body.duration,
        dateRelease: req.body.dateRelease,
        description: req.body.description,
        image: imageStr,
        views: 0,
        video: videoStr
    });

    show.save()
        .then(() => res.redirect(`/shows/${show._id}`))
        .catch(err => {
            let field = ['name', 'genre', 'country', 'ratingIMDB', 'duration', 'dateRelease', 'description','image', 'video'];
            let errors = [];

            if (err.name === 'MongoError' && err.code === 11000) {
                errors.push("Show already exist!");
            }else {
                for (let it of field)
                    if (err.errors[it]) errors.push(err.errors[it].message);
            }

            res.render(`add`, {
                error: errors[0],
                name: "New Show",
                user: req.user,
                list: result[0],
                countries: result[1],
                genres: result[2]
            });
        });
});

module.exports = router;