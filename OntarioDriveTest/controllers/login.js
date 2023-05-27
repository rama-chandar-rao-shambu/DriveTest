const User = require('../models/User');
const bcrypt = require('bcrypt');
const { errorHandler, customErrorHandler, customSuccessHandler } = require('./scripts');

let isRegister = false;

const register = (req, res) => {
    try{
        isRegister = true;
        User.create({
            username: req.body.username,
            password: req.body.password,
            userType: req.body.userType,
        }, (error, user) => {
            if(error || user.length == 0){
                errorHandler(req, error);
            }
            else{
                customSuccessHandler(req, "User successfully registered")
            }
            res.redirect("/login");
        })
    }
    catch(err){
        console.log("error occurred while creating a new user ", err)
    }
    
}

const loginPost = (req, res) => {
    User.findOne({username: req.body.username}, (error, user) => {
        if(error || !user){
            customErrorHandler(req, "Incorrect username or password");
            res.redirect("/login")
        }
        else{
            bcrypt.compare(req.body.password, user.password, (bcryptError, same) => {
                if(same){
                    console.log("user is authenticated ", user._id)
                    req.session.userId = user._id;
                    req.session.userType = user.userType;
                    res.redirect('/');
                }
                else{
                    customErrorHandler(req, "Incorrect username or password");
                    res.redirect("/login")
                }
            })
        }
    })
}

const loginGet = (req, res) => {
    const data = req.flash('data')[0];
    let username, password, repeatPwd, userType = ""
    if(typeof data != "undefined"){
        username = data.username;
        password = data.password;
        repeatPwd = data.repeatPwd?? repeatPwd;
        userType = data.userType?? userType;
    }
    res.render("login", {errors: req.flash('validationErrors'), success: req.flash('success'), username, password, repeatPwd, userType, isRegister})
    isRegister = false;
}
module.exports = {register, loginPost, loginGet}