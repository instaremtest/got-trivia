const { users } = require("../models/users.js");
const { authenticate } = require("../middleware/authenticate.js");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

module.exports = function (app) {

    //users POST
    app.post("/users", (req, res) => {

        var body = _.pick(req.body, ["email", "password"])
        var newUser = new users(body);

        newUser.save().then((doc) => {
            // res.send(doc);
            return newUser.generateAuthToken();
        }, (err) => {
            // console.log(req);
            res.status(400).send(err);
        }).then((token) => {
            return res.header("x-auth", token).send(newUser);
        }).catch((err) => {
            return res.status(400).send(err);
        })

    });

    //users GET
    app.get("/users", authenticate, (req, res, next) => {

        users.find({}).then((doc) => {
            res.send({
                doc
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });

    //users/login POST
    app.post("/users/login", (req, res) => {
        var body = _.pick(req.body, ["email", "password"]);

        users.findByCredentials(body.email, body.password).then((user) => {
            return user.generateAuthToken().then((token) => {
                return res.header("x-auth", token).send(user);
            }, (err) => {
                return res.status(401).send();
            });
        }, (err) => {
            return res.status(500).send();
        }).catch((err) => {
            return res.status(500).send();
        })
    });

}
