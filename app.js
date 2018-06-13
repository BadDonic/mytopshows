const express = require('express');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const {User, sha512} = require('./modules/db');
const {port, serverSalt} = require('./modules/config');

let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboyBodyParser({ limit: '10mb'}));
app.use(cookieParser());
app.use(session({
    secret: 'SEGReT$25_',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/public', express.static(__dirname + '/public'));
app.use('/views', express.static(__dirname + '/views'));
app.use('/', require('./routes'));

app.use((req, res) => res.render('error', {
    name: '404',
    user: req.user,
}));
app.listen(port, () => console.log(`Started on port ${port}`));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(user ? null : 'No user', user));
});

passport.use('login',new LocalStrategy((username, password, done) => {
    const passwordHash = sha512(password, serverSalt).passwordHash;
    User.findOne({username: username})
        .then(user => {
            if (!user) done('No such users', user);
            if (user.passwordHash !== passwordHash) done('Incorrect password', user);
            done(null, user);
        })
        .catch(err => done(err, false));
}));