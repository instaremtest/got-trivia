var mongoose = require("mongoose");
var validator = require("validator");
var _ = require("lodash");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        minlength: 1,
        trim: true,
        unique: [true, "Email is already registered."],
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email."
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.generateAuthToken = function () {
    var userObj = this;
    var access = "auth";
    var token = jwt.sign({
        _id: userObj._id.toHexString(),
        access
    }, process.env.JWT_SECRET_KEY).toString();

    userObj.tokens.push({ access, token });

    // return token;
    return userObj.save().then(() => {
        return token;
    }).catch((e) => {
        console.log(e)
    })

};

UserSchema.methods.toJSON = function () {
    var userObj = this.toObject();
    return _.pick(userObj, ["_id", "email"])
}

UserSchema.statics.findByToken = function (token) {
    var userObj = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (e) {
        return Promise.reject();
    }

    return userObj.findOne({
        _id: decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });

}

UserSchema.statics.findByCredentials = function (email, password) {
    var userObj = this;

    return userObj.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};


UserSchema.pre("save", function (next) {
    var userObj = this;

    if (userObj.isModified("password")) {
        var p1 = bcrypt.genSalt(10, (err, salt) => {
            var p1 = bcrypt.hash(userObj.password, salt, (err, hash) => {
                userObj.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

var users = mongoose.model("users", UserSchema);

module.exports = {
    users,
    mongoose
}
