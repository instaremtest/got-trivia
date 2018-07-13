var mongoose = require("mongoose");
var validator = require("validator");
var _ = require("lodash");

var battles = mongoose.model(
    'battles',
    new mongoose.Schema({},
        { collection: 'battles' })
);   // collection name


module.exports = {
    battles,
    mongoose
}
