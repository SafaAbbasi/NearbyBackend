const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const User = require('../model/User')

passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_SECRET
}, (payLoad, done) => {
    User.findById(payLoad.sub)
        .then(user => {
            return done(null, user, "User logged in")
        })
        .catch(error => {
            return done({ error: "User doesn't exist" }, false)
        })
}))
