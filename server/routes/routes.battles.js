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
    app.get(["/battles/count", "/count"], authenticate, (req, res) => {

        battles.countDocuments({}).then((count) => {
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
    app.get(["/battles/list", "/list"], authenticate, (req, res) => {

        battles.aggregate(
            [
                { $project: { _id: 0, battleLocations: { $concat: ["$location", " (", "$region", ")"] } } }
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
    app.get(["/battles/search", "/search"], authenticate, (req, res) => {

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
    app.get(["/battles/stats", "/stats"], authenticate, async (req, res) => {
        
        return res.status(200).send({
            "defender_size": await (async function () {

                var data;

                data = await battles.aggregate([
                    {
                        $match: {
                            defender_size: { $exists: true, $nin: ["", null] }
                        }
                    },
                    {
                        $group: {
                            _id: "defender_size",
                            average: { $avg: "$defender_size" },
                            min: { $min: "$defender_size" },
                            max: { $max: "$defender_size" }
                        }
                    }
                    , { $project: { _id: 0 } }
                ]);

                return data[0];
            })(),
            "battle_type": await battles.distinct("battle_type", { battle_type: { $nin: ["", null] } }),
            "attacker_outcome": {
                "win": await battles.countDocuments({ attacker_outcome: "win" }),
                "loss": await battles.countDocuments({ attacker_outcome: "loss" })
            },
            "most_active": await (async function () {
                var op = {};
                var data;

                data = (await battles.aggregate([{ $group: { _id: "$attacker_king", battle_cnt: { $sum: 1 } } }, { $sort: { battle_cnt: -1 } }, { $limit: 1 }, { $project: { _id: 1 } }]))

                op.attacker_king = data[0]._id

                data = (await battles.aggregate([{ $group: { _id: "$defender_king", battle_cnt: { $sum: 1 } } }, { $sort: { battle_cnt: -1 } }, { $limit: 1 }, { $project: { _id: 1 } }]))

                op.defender_king = data[0]._id

                data = (await battles.aggregate([{ $group: { _id: "$region", battle_cnt: { $sum: 1 } } }, { $sort: { battle_cnt: -1 } }, { $limit: 1 }, { $project: { _id: 1 } }]))

                op.region = data[0]._id

                data = (await battles.aggregate([{ $group: { _id: "$name", battle_cnt: { $sum: 1 } } }, { $sort: { battle_cnt: -1 } }, { $limit: 1 }, { $project: { _id: 1 } }]))

                op.name = data[0]._id

                return op;

            })()

        })


    })



}
