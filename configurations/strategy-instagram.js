const passport = require('passport');
const User = require('../model/User')
const InstagramTokenStrategy = require('passport-instagram-token').Strategy

passport.use(new InstagramTokenStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    passReqToCallback: true
}, (accessToken, refreshToken, profile, done) => {
    try {
        console.log("==================== Instagram Profile ====================");
        console.log(profile);
        console.log("___________________________________________________________");

        done(null, profile)
    } catch (error) {
        console.log(error);
        return done(error, false)
    }
}))
