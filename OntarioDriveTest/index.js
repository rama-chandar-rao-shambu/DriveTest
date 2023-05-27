const express = require('express');
const app = new express();
const expressSession = require('express-session');
const flash = require('connect-flash');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.set('view engine', 'ejs');


app.use(
    expressSession({
        secret: "blend-with-code",
    })
);
app.use(flash());

const home = require('./controllers/home');
const {getGTest, postGTest, getGTestParam, bookGAppointment} = require('./controllers/g');
const {getG2Test, postG2Test, getG2TestParam, bookG2Appointment} = require('./controllers/g2');
const {register, loginPost, loginGet} = require('./controllers/login');

const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated');
const {getAppointment, getAppointmentParam, postAppointment, getApprovedRejectedUserDetails} = require('./controllers/Appointment');
const logout = require('./controllers/logout');
const { getUserTestDetails, getUserDetails, updateUserDetails } = require('./controllers/examiner');



if(typeof global.loggedIn == undefined){
    global.loggedIn = null;
}
if(typeof global.userType == undefined){
    global.userType = null;
}
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId;
    userType = req.session.userType;
    next();
});

// Serve pages using ejs engine
app.get('/', home);

app.get('/appointment/display-ar', authMiddleware, getApprovedRejectedUserDetails);
app.get('/appointment/:date', authMiddleware, getAppointmentParam);
app.get('/appointment', authMiddleware, getAppointment);
app.post('/appointment', authMiddleware, postAppointment);

app.post('/register', redirectIfAuthenticated, register);
app.get('/login', redirectIfAuthenticated, loginGet);
app.post('/login', redirectIfAuthenticated, loginPost);
app.get('/logout', logout);

app.get('/G2_Test',authMiddleware, getG2Test);
app.get('/G2_Test/:date',authMiddleware, getG2TestParam);
app.post('/G2_Test/bookAppointment',authMiddleware, bookG2Appointment);
app.post('/G2_Test',authMiddleware, postG2Test);

app.get("/G_Test",authMiddleware, getGTest);
app.get('/G_Test/:date',authMiddleware, getGTestParam);
app.post('/G_Test/bookAppointment',authMiddleware, bookGAppointment);
app.post('/G_Test',authMiddleware, postGTest);

app.get('/Examiner',authMiddleware, getUserTestDetails);
app.get('/Examiner/:testType/:id',authMiddleware, getUserDetails);
app.post('/Examiner/:testType/:id',authMiddleware, updateUserDetails);
app.use((req, res) => res.render("notFound"));

app.listen(4000, () => {
    console.log('server is started!');
});