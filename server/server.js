require("./config/config.js");
require("./db/mongoose.js");
var express = require("express");
var bodyParser = require("body-parser");
var port = process.env.PORT;
var _ = require("lodash");

var app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(new Date(), " : " + req.method + " request for " + req.url);
    next();
});

require("./routes/loadroutes.js")(app);

app.get("/", (req, res) => {

    var msgArr = [];
    msgArr.push("Hello")
    msgArr.push("")
    msgArr.push("To login use")
    msgArr.push("User/Password : user_401@gmail.com/pass123")
    msgArr.push("OR")
    msgArr.push("JWT_TOKEN : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjRiMmMzZTFhZGVmMTA3MjliNjAxODIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTMxNjUzOTU3fQ.5aEyK8x5R3bTTj1npcod4i4NMYo8IKGIco3sYATMJlk")


    msgArr.push("")
    msgArr.push("Following are the supported URIs")

    app._router.stack.forEach(function (rt) {
        if (rt.route && rt.route.path && rt.route.path != "*" && rt.route.path != "/" ) {
            // console.log(JSON.stringify(rt.route.methods))
            if (rt.route.methods.get) msgArr.push("GET " + rt.route.path)
            if (rt.route.methods.post) msgArr.push("POST " + rt.route.path)
        }
    })

    res.status(200).send(msgArr.join("<br>"));
});

app.get("*", (req, res) => {
    res.status(404).send("Route not supported.");
});


app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
})

module.exports = {
    app
};
