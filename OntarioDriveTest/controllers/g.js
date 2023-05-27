const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { customErrorHandler, errorHandler } = require('./scripts');

let date = new Date();
date = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2,"0") + "-" + date.getDate().toString().padStart(2,"0");
let selectedDate = date;

const getGTest = (req, res) => {
    User.findById(req.session.userId, (error, userDetails) => {
        if(error || !userDetails || !userDetails.appointmentId){
            customErrorHandler(req, "Please book an appointment for G2 to proceed with G Test")
            res.redirect('/G2_Test');
        }
        else{
            const data = req.flash('data')[0];
            if(typeof data != "undefined" && data.make){
                userDetails.carDetails.make = data.make;
                userDetails.carDetails.model = data.model;
                userDetails.carDetails.year = data.year;
                userDetails.carDetails.plateNo = data.plateNo;
            }
            const map = new Map();
            Appointment.findById(userDetails.appointmentId, (error, appointment) => {
                if(appointment && userDetails.testType === 'G'){
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
                    res.render('gTest', {user: userDetails, errors: req.flash('validationErrors'), minDate: date, date: selectedDate.toString(), appointment: map, time: time});
                })
            });
        }
    })
};

const bookGAppointment = (req, res) => {
    const body = req.body;
    const payload = {
        date: body.date,
        time: body.time
    }
    if(payload.date && payload.time){
        User.findById(req.session.userId, (error, userDetails) => {
            if(!error && userDetails && (userDetails.status && userDetails.testType === 'G2' || userDetails.testType === 'G')){
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
                                User.findByIdAndUpdate(req.session.userId, {appointmentId: updatedAppointment._id, testType: 'G', status: null, comment: null}, (error, _) => {
                                    if(!error){
                                        console.log("succesfully updated the appointment date and time")
                                    }
                                    else{
                                        errorHandler(req, error);
                                    }
                                    res.redirect("/G_Test");
                                })
                            }
                            else{
                                errorHandler(req, err);
                                res.redirect("/G_Test");
                            }
                        })
                       
                    }
                })
            }
            else{
                customErrorHandler(req, "You need G2 license to proceed with G Appointment");
                res.redirect("/G_Test");
            }
        })
    }
    else{
        customErrorHandler(req, "Please choose appointment date and time")
        res.redirect("/G_Test")
    }
}

const postGTest = (req, res) => {
    User.findByIdAndUpdate(req.session.userId,
        {
            carDetails:{
                make: req.body.make,
                model: req.body.model,
                year: req.body.year,
                plateNo: req.body.plateNo
            }
        }, (error, userDetails) => {
        if(error || !userDetails){
            errorHandler(req, error);
            console.log("error occurred while updating")
        }
        res.redirect('/G_Test');
    })
};

const getGTestParam = (req, res) => {
    selectedDate = req.params.date;
    res.redirect("/G_Test");
}

module.exports = {getGTest, postGTest, bookGAppointment, getGTestParam}