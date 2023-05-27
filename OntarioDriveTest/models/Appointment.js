const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    date: {
        type: String,
        required: [true, "Please select a date"]
    },
    time: {
        type: String,
        required: [true, "Please select a time for your appointment"]
    },
    isTimeSlotAvailable: {
        default: true,
        type: Boolean
    }
})
appointmentSchema.plugin(uniqueValidator);
const appointment = mongoose.model("appointment", appointmentSchema);

module.exports = appointment;