require("./config/config.js");
require("./db/mongoose.js");
var express = require("express");
var bodyParser = require("body-parser");
var port = process.env.PORT;

var app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(new Date(), " : " + req.method + " request for " + req.url);
    next();
});

require("./routes/loadroutes.js")(app);

app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
})

module.exports = {
    app
};
