const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { errorHandler, customSuccessHandler } = require('./scripts');
let date = new Date();
date = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-" + date.getDate().toString().padStart(2,"0");
let selectedDate = date;
let user = null;
let displayTable = false;

const getAppointmentParam = (req, res) => {
    selectedDate = req.params.date;
    res.redirect("/appointment");
}

const getAppointment = (req, res) => {
    Appointment.find({date: selectedDate}, (error, appointment) => {
        const map = new Map();
        appointment.forEach(obj => {
            const {date, time} = obj;
            if(map.has(date)){
                map.get(date).push(time)
            }
            else map.set(date, [time]);
        })
        const data = req.flash('data')[0];
        if(typeof data != "undefined"){
            appointment.date = data.date;
            appointment.time = data.time;
        }
        res.render("appointment", {
            appointment : map || {},
            date: selectedDate?.toString(),
            minDate: date,
            errors: req.flash('validationErrors'),
            success: req.flash('success'),
            user,
            displayTable
        });
        displayTable = false;
        user = null;
    })
}

const postAppointment = (req, res) => {
    const payload = {
        date: req.body.date,
        time: req.body.time
    };
    if(payload.date && payload.time){
        Appointment.create(payload, (error, appointment) => {
            if(error || appointment.length == 0){
                errorHandler(req, error);
            }
            else{
                customSuccessHandler(req, "Appointment succesfully added on Date " + payload.date + ", Time " + payload.time);
            }
            res.redirect("/appointment");
    
        })
    }
    else{
        customSuccessHandler(req, "Please fill all the details");
        res.redirect("/appointment");
    }
}

const getApprovedRejectedUserDetails = (req, res) => {
    User.find({status: {$in : [true, false]}}).populate('appointmentId')
        .then(userDetails => {
            if(userDetails.length > 0){
                user = userDetails;
            }
            else user = null;
            displayTable = true;
            res.redirect("/appointment");
        })
        .catch(err => {
            user = null;
            customSuccessHandler("Error fetching user details")
            res.redirect("/appointment");
        })
}
module.exports = {getAppointmentParam, getAppointment, postAppointment, getApprovedRejectedUserDetails}