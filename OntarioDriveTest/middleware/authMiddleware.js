const User = require('../models/User');

module.exports = (req, res, next) => {
    if(!req.session.userId){
        return res.redirect("/login");
    }
    else if(req.session.userType?.toLowerCase() == "driver"){
        User.findById(req.session.userId, (error, user) => {
            if(error || !user || user.length == 0){
                return res.redirect("/login");
            }
        })
    }
    else if(req.session.userType?.toLowerCase() == "admin"){
        User.findById(req.session.userId, (error, user) => {
            if(error || !user || user.length == 0){
                return res.redirect("/login");
            }
        })
    }
    else if (req.session.userType?.toLowerCase() == "examiner"){
        User.findById(req.session.userId, (error, user) => {
            if(error || !user || user.length == 0){
                return res.redirect("/login");
            }
        })
    }
    next();
}