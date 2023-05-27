const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.connect("mongodb+srv://gollum:gollum@cluster0.ft2tqhy.mongodb.net/ontarioDriveTest", {useNewUrlParser: true});

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstName: {
        type: String,
        default: "default"
    },
    lastName: {
        type: String,
        default: "default"
    },
    licenseNo: {
        type: String,
        default: "default"
    },
    age:{
        type: Number,
        default: 0
    },
    username: {
        type: String,
        default: "demo",
        required: [true, "Username is required"],
        unique: true
    },
    password: {
        type: String,
        default: "demo",
        required: [true, "Password cannot be empty"]
    },
    userType: {
        type: String,
        default: "Driver"
    },
    dob:{
        type: String,
        default: "default"
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        default: null,
    },
    testType:{
        type: String
    },
    comment:{
        type: String
    },
    status: Boolean,
    carDetails:{
        make:{
            type: String,
            default: "default"
        },
        model:{
            type: String,
            default: "default"
        },
        year:{
            type: Number,
            default: 0
        },
        plateNo:{
            type: String,
            default: "default"
        }
    }
});
UserSchema.plugin(uniqueValidator);


UserSchema.pre('save',  function(next){
    const currentUser = this;
    bcrypt.hash(currentUser.password, 10, (error, hash) => {
        currentUser.password = hash;
        next();
    });
})

const User = mongoose.model('User', UserSchema);

module.exports = User;