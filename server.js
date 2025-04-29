require('dotenv').config();
const cors = require('cors')
const express = require('express');
const app = express();
const routes = require('./router/index');
const passport = require('passport');

// const io = require('socketio');


// CORS
app.use(cors())

app.use(passport.initialize())

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Setting up session
const session = require('express-session');
app.use(
    session({
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge : 1000 * 60 * 2
        }
    })
)

// DB connection
require('./model/connection');

// routes
app.use('/api', routes) 

// System Status
const { successMsg } = require('./model/Logs');
app.get('/system-status/:lng', async (req,res)=>{
    res.status(200).json({ message : await successMsg(700,req.params.lng) })
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening to port ${PORT}`);
})
