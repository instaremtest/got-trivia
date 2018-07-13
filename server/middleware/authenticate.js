const { users } = require("./../models/users");

var authenticate = function (req, res, next) {
    var token = req.header("x-auth");

    users.findByToken(token).then((doc) => {

        if (!doc) {
            new Promise.reject();
        }

        req.user = doc;
        req.token = token;
        next();

    }).catch((e) => {
        res.status(401).send({});
    });

}

module.exports = { authenticate }

