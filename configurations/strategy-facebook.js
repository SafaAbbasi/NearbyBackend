const passport = require('passport');
const User = require('../model/User')
const FacebookTokenStrategy = require('passport-facebook-token')

// Passport Google Authentication

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
                       
            // If user already loggedin with facebookId

            let facebookIdExists = await User.findOne({ 'facebook.facebookId': profile.id });
            if (facebookIdExists) {
                console.log("User Already Exists with this facebook id.. logging in with facebook");
                return done(null, facebookIdExists)
            }

            // If user already registered with requested email

            let emailExists = await User.findOne({$or:[
                {'profile.contactInformation.primaryEmail' : profile.emails[0].value},
                {'profile.contactInformation.secondaryEmails' : profile.emails[0].value},
            ]})
        
            if (emailExists) {
                console.log("User already registered with this email.. logging in with facebook");
                emailExists.signupStrategies=[...emailExists.signupStrategies,'facebook'];
                emailExists.facebook = {
                    facebookId: profile.id,
                    displayName: profile.displayName,
                    // email: profile.emails[0].value,
                    // isEmailVerified:profile.emails[0].value ? true : false,
                    picture: profile._json.picture ? profile._json.picture : null
                }
                await emailExists.save();

                return done(null,emailExists)
            }

            // if new User
            else{
                let newUser = new User({
                    facebook : {
                        facebookId: profile.id,
                        displayName: profile.displayName,
                        // email: profile.emails[0].value ? profile.emails[0].value : null,
                        // isEmailVerified:profile.emails[0].value ? true : false,
                        picture:profile._json.picture ? profile._json.picture : null
                    }
                })
                newUser.profile.contactInformation.primaryEmail = profile.emails[0].value ? profile.emails[0].value : null
                newUser.signupStrategies.push('facebook')
                await newUser.save();
                console.log("New User saved by facebook Strategy");
                return done(null, newUser)                              
            }
        } catch (error) {
            console.log(error);
            return done(error, false)
        }
}))