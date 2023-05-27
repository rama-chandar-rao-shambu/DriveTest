const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { errorHandler, customErrorHandler } = require('./scripts');

let date = new Date();
date = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-" + date.getDate().toString().padStart(2,"0");
let selectedDate = date;

const getG2TestParam = (req, res) => {
    selectedDate = req.params.date;
    res.redirect("/G2_Test");
}

const getG2Test =  (req, res) => {
    User.findById(req.session.userId, (error, userDetails) => {
        const map = new Map();
        let time = null;
        if(!error && userDetails){
            userDetails = clearDefaultDetails(userDetails);
        }
        const data = req.flash('data')[0];
        if(typeof data != "undefined" && data.firstName){
            userDetails.firstName = data.firstName;
            userDetails.lastName = data.lastName;
            userDetails.licenseNo = data.licenseNo;
            userDetails.age = data.age;
            userDetails.dob = data.dob;
            userDetails.date = data.date;
            userDetails.time = data.time;

            userDetails.carDetails.make = data.make;
            userDetails.carDetails.model = data.model;
            userDetails.carDetails.year = data.year;
            userDetails.carDetails.plateNo = data.plateNo;
        }
        Appointment.findById(userDetails.appointmentId, (error, appointment) => {
            if(appointment){
                selectedDate = appointment.date;
                time = appointment.time;
            }
            Appointment.find({date: selectedDate, isTimeSlotAvailable: true}, (error, appointment) => {
                if(appointment.length > 0){
                    appointment.forEach(obj => {
                        const {date, time} = obj;
                        if(map.has(date)){
                            map.get(date).push(time)
                        }
                        else map.set(date, [time]);
                    })
                }
                res.render('g2Test', {user: userDetails, appointment: map, date: selectedDate.toString(), minDate: date, time, errors: req.flash('validationErrors')});
            })
        })
    })
};

const postG2Test = (req, res) => {
    const body = req.body;
    const payload = {
        firstName:body.firstName,
        lastName:body.lastName,
        age:body.age,
        dob:body.dob,
        licenseNo:body.licenseNo,
        carDetails:{
            make:body.make,
            model:body.model,
            year:body.year,
            plateNo:body.plateNo
        }
    }
   
    User.findByIdAndUpdate(req.session.userId ,payload, (error, userDetails) => {
        if(error || !userDetails){
            errorHandler(req, error);
            console.log("error occurred while updating g2 details")
        }
        else{
            res.redirect("/G2_Test")
        }
    })
};

const bookG2Appointment = (req, res) => {
    const body = req.body;
    const payload = {
        date: body.date,
        time: body.time
    }
    if(payload.date && payload.time){
        User.findById(req.session.userId, (error, userDetails) => {
            userDetails = clearDefaultDetails(userDetails);
            if(!error && userDetails && userDetails.firstName){
                Appointment.find({date: payload.date, time: payload.time}, (error, apppointment) => {
                    if(!error && apppointment._id !== userDetails.appointmentId){
                        if(userDetails.appointmentId){
                            Appointment.findByIdAndUpdate(userDetails.appointmentId, {isTimeSlotAvailable: true}, (err, _) => {
                                if(!err){
                                    console.log("Older appointment succesfully released")
                                }
                                else{
                                    errorHandler(req, err);
                                }
                            })
                        }
                        
                        Appointment.findOneAndUpdate({date: payload.date, time: payload.time}, {isTimeSlotAvailable: false}, (err, updatedAppointment) => {
                            if(!err && updatedAppointment){
                                console.log("Appointment succesfully created");
                                User.findByIdAndUpdate(req.session.userId, {appointmentId: updatedAppointment._id, testType: 'G2', status: null, comment: null}, (error, _) => {
                                    if(!error){
                                        console.log("succesfully updated the appointment date and time")
                                    }
                                    else{
                                        errorHandler(req, error);
                                    }
                                    res.redirect("/G2_Test");
                                })
                            }
                            else{
                                errorHandler(req, err);
                                res.redirect("/G2_Test");
                            }
                        })
                       
                    }
                })
            }
            else{
                customErrorHandler(req, "Please fill User Details");
                res.redirect("/G2_Test")
            }
        })
    }
    else{
        customErrorHandler(req, "Please choose appointment date and time")
        res.redirect("/G2_Test")
    }
}

const clearDefaultDetails = (userDetails) => {
    if(userDetails.firstName?.toLowerCase() == "default"){
        userDetails.firstName = "";
    }
    if(userDetails.lastName?.toLowerCase() == "default"){
        userDetails.lastName = "";
    }
    if(userDetails.age == 0){
        userDetails.age = "";
    }
    if(userDetails.dob.toLowerCase() == "default"){
        userDetails.dob = "";
    }
    if(userDetails.licenseNo.toLowerCase() == "default"){
        userDetails.licenseNo = "";
    }

    if(userDetails.carDetails.make.toLowerCase() == "default"){
        userDetails.carDetails.make = "";
    }
    if(userDetails.carDetails.model.toLowerCase() == "default"){
        userDetails.carDetails.model = "";
    }
    if(userDetails.carDetails.year == 0){
        userDetails.carDetails.year = "";
    }
    if(userDetails.carDetails.plateNo.toLowerCase() == "default"){
        userDetails.carDetails.plateNo = "";
    }
    return userDetails;
}

module.exports = {getG2Test, postG2Test, getG2TestParam, clearDefaultDetails, bookG2Appointment}