const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DBURL, { useNewUrlParser: true }).then((res) => {
    // console.log(res)
    console.log("MongoDB connection establised successfully.")
}).catch((err) => {
    console.log(err)
});

module.exports = { mongoose }

