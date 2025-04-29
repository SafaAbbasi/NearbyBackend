const passport = require('passport')
const User = require('../model/User')
const GoogleTokenStrategy = require('passport-google-token').Strategy;

// Passport Google Authentication

passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
},
    async (accessToken, refreshToken, profile, done) => {
        try {

            // If user already loggedin with googleId
            
            let googleIdExists = await User.findOne({ 'google.googleId': profile.id });
            if (googleIdExists) {
                console.log("User Already Exists with this google id.. logging in with google");
                return done(null, googleIdExists)
            }

            // If user already registered with requested email

            let emailExists = await User.findOne({$or:[
                {'profile.contactInformation.primaryEmail' : profile.emails[0].value},
                {'profile.contactInformation.secondaryEmails' : profile.emails[0].value},
            ]});  

            if(emailExists){
                console.log("User already registered with this email.. logging in with google");
                emailExists.signupStrategies=[...emailExists.signupStrategies,'google'];
                emailExists.google = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    // email: profile.emails[0].value,
                    // isEmailVerified:profile.emails[0].value ? true : false,
                    picture: profile._json.picture ? profile._json.picture : null
                }
                await emailExists.save();

                return done(null,emailExists)
            }

            // If new user

            else{
                let newUser = new User({
                    google: {
                        googleId: profile.id,
                        displayName: profile.displayName,
                        // email: profile.emails[0].value,
                        // isEmailVerified:profile.emails[0].value ? true : false,
                        picture:profile._json.picture ? profile._json.picture : null
                    }
                })
                newUser.profile.contactInformation.primaryEmail = profile.emails[0].value;
                newUser.signupStrategies.push('google');
                await newUser.save();
                console.log("New user save by Google strategy");
                return done(null, newUser);
            }
        }
        catch (err) {
            console.log(err);
            done(err, false)
        }
    })
)