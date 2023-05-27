const User = require('../models/User');

const { customErrorHandler, errorHandler } = require('./scripts');

let allUserDetails = null;
const getUserTestDetails = (req, res) => {
    const testType = req.query.testType?.toUpperCase() || 'ALL';
    if(['ALL', 'G', 'G2'].includes(testType?.toUpperCase())){
        if(testType.toUpperCase() == 'ALL'){
            User.find({appointmentId: {$ne: null}, status: {$eq: null}}).populate('appointmentId')
                .then((userDetails) => {
                    allUserDetails = userDetails;
                    res.render('examiner', {user: userDetails || [], errors: req.flash('validationErrors'), testType, displayUserDetails: false});
                })
                .catch(err => {
                    customErrorHandler(req, "Error fetching all appointment details")
                    res.render('examiner', {user: userDetails || [], errors: req.flash('validationErrors'), testType, displayUserDetails: false});
                })
        }
        else{
            User.find({testType: testType, status: {$eq: null}}).populate('appointmentId')
                .then((userDetails) => {
                    allUserDetails = userDetails;
                    res.render('examiner', {user: userDetails || [], testType, errors: req.flash('validationErrors'), testType, displayUserDetails: false});
                })
                .catch(err => {
                    customErrorHandler(req, "Error fetching" + testType + " appointment details")
                    res.render('examiner', {user: userDetails || [], errors: req.flash('validationErrors'), testType, displayUserDetails: false});
                })
        }
    }
    else{
        customErrorHandler(req, 'Invalid Test Type');
        res.render('examiner', {user: [], errors: req.flash('validationErrors'), testType, displayUserDetails: false});
    }
}

const getUserDetails = (req, res) => {
    const testType = req.params.testType || 'ALL';
    const id = req.params.id;
    User.findById(id, (error, userDetails) => {
        if(error && !userDetails){
            customErrorHandler(req, "Invalid User ID");
        }
        res.render('examiner', {displayUserDetails: true, matchedUser: userDetails,  user: allUserDetails || [], testType, errors: req.flash('validationErrors')});
    })
}

const updateUserDetails = (req, res) => {
    const testType = req.params.testType || 'ALL';
    const id = req.params.id;
    const payload = {
        comment: req.body.comments,
        status: req.body.status?.toLowerCase() === "pass"
    }
    if(!payload.comment?.trim()){
        customErrorHandler(req, "Comments are required");
        res.redirect('/Examiner?testType='+testType);
        return;
    }
    User.findByIdAndUpdate(id, payload, (error, userDetails) => {
        res.redirect('/Examiner?testType='+testType);
    })
}

module.exports = {getUserTestDetails, getUserDetails, updateUserDetails};