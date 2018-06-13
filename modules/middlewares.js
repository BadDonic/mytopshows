const auth = require('basic-auth');
const {User, sha512} = require('./db');
const serverSalt = require('./config').serverSalt;

module.exports = {
    checkAuth: function(req, res, next) {
        if(!req.user) return res.redirect('/users/login');
        next();
    },
    checkAdmin: function(req, res, next) {
        if (!req.user) return res.redirect('/users/login');
        if (req.user.role !== 'admin')
            return res.render('error', {
                name: '403',
                user: req.user,
            });
        next();
    },
    checkAuthApi: function(req, res, next) {
        let credentials = auth(req);
        if (!credentials || !credentials.name || !credentials.pass) return res.status(401).send({
            status: '401',
            message: 'Unauthorized',
            error: 'No credentials'
        });

        let passwordHash = sha512(credentials.pass, serverSalt).passwordHash;
        User.findOne({username: credentials.name}).exec()
            .then(user => {
                if (!user)
                    return res.status(401).send({
                        status: '401',
                        message: 'Unauthorized',
                        error: "No such user"
                    });
                if (user.passwordHash !== passwordHash)
                    return res.status(401).send({
                        status: '401',
                        message: 'Unauthorized',
                        error: "Incorrect password"
                    });
                next();
            })
            .catch(err => res.status(500).send({
                status: '500',
                message: 'Internal server error',
                error: err
            }));
    },
    checkAdminApi: function (req, res, next) {
        let credentials = auth(req);
        if (!credentials || !credentials.name || !credentials.pass) res.status(401).send({
            status: '401',
            message: 'Unauthorized',
            error: 'No credentials'
        });

        let passwordHash = sha512(credentials.pass, serverSalt).passwordHash;
        User.findOne({username: credentials.name}).exec()
            .then(user => {
                if (!user)
                    return res.status(401).send({
                        status: '401',
                        message: 'Unauthorized',
                        error: "No such user"
                    });
                if (user.passwordHash !== passwordHash)
                    return res.status(401).send({
                        status: '401',
                        message: 'Unauthorized',
                        error: "Incorrect password"
                    });
                if (user.role === 'user')
                    return res.status(403).send({
                        status: '403',
                        message: 'Forbidden',
                        error: "This user's not admin"
                    });
                next();
            })
            .catch(err => res.status(500).send({
                status: '500',
                message: 'Internal server error',
                error: err
            }));
    }
};