const { battles } = require("../models/battles.js");
const { authenticate } = require("../middleware/authenticate.js");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

module.exports = function (app) {

    //battles GET
    app.get("/battles", authenticate, (req, res) => {

        battles.find({}).then((doc) => {
            res.send({
                doc
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });

    //battles/count GET 
    app.get("/battles/count", authenticate, (req, res) => {

        battles.count({}).then((count) => {
            res.send({
                count
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });

    //battles/list GET 
    app.get("/battles/list", authenticate, (req, res) => {


        // db.getCollection('battles').aggregate(
        //     [
        //        { $project: { battleLocations: { $concat: [ "$location", " (", "$region",")" ] } } }
        //     ]
        //  )

        battles.aggregate(
            [
                { $project: { battleLocations: { $concat: ["$location", " (", "$region", ")"] } } }
            ]
        ).then((locations) => {
            res.send({
                locations
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });

    //battles/list GET 
    app.get("/battles/search", authenticate, (req, res) => {

        var columnAlias = {
            "type": "battle_type"
        };

        var finalQuery = ((query) => {

            if (_.isEmpty(query)) return {};
            var modQuery = { "$and": [] };
            var fData = {};

            _.forOwn(query, function (value, key) {
                fData = {};
                if (key === "king") {
                    modQuery["$and"].push(
                        {
                            $or: [
                                { "attacker_king": value },
                                { "defender_king": value }
                            ]
                        }
                    )
                } else {
                    if (columnAlias[key]) key = columnAlias[key]
                    fData[key] = value;
                    modQuery["$and"].push(fData)
                }
            });

            return modQuery;

        })(req.query)

        // console.log(JSON.stringify(finalQuery))

        battles.find(
            finalQuery
        ).then((data) => {
            res.send({
                data
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });



    //battles/stats GET 
    app.get("/battles/stats", authenticate, (req, res) => {

        battles.aggregate(
            [
                { $project: { battleLocations: { $concat: ["$location", " (", "$region", ")"] } } }
            ]
        ).then((locations) => {
            res.send({
                locations
            });
        }, (err) => {
            res.status(400).send(err);
        }).catch((err) => {
            res.status(400).send(err);
        })
    });



}
