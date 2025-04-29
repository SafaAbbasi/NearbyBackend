const express = require('express');
const app = express();


// Signup route
const signupRoute = require('./UserSignup')
app.use('/users', signupRoute)

// Facebook Signup/Signin
const facebookStrategy = require('./facebookStrategy');
app.use('/oauth/facebook', facebookStrategy)

// Google Signup/Signin
const googleStrategy = require('./googleStrategy');
app.use('/oauth/google', googleStrategy)

// Instagram Signup/Signin
// const instagramStrategy = require('./instagramStrategy');
// app.use('/oauth/instagram', instagramStrategy)

// Profile Route
const profileRoute = require('./profile/profile');
app.use('/profile', profileRoute)

// Listings Route
const listingRoutes = require('./list/list');
app.use('/list', listingRoutes);

const userProfileRouter = require('./userProfile/userProfile')
app.use('/user-profile', userProfileRouter)

module.exports = app