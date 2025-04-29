const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const userSchema = new Schema({
    language : {type:String, default:"en"},
    signupStrategies : [],
    local: {
        firstName: { type: String },
        lastName: { type: String },
        phoneNum: { type: String },
        email: { type: String, lowercase: true },
        isEmailVerified:{type:String},
        password: { type: String, minlength: 8 },
    },
    google: {
        googleId: { type: String },
        displayName: { type: String },
        email: { type: String, lowercase: true },
        isEmailVerified:{type:String},
        picture: {type:String}
    },
    facebook: {
        facebookId: { type: String },
        displayName: { type: String },
        email: { type: String, lowercase: true },
        isEmailVerified:{ type: String },
        picture: { type: String }
    },
    profile : {
        profilePic : { type: String },
        accountInformation : {
            displayName : { type: String },
            firstName : { type: String },
            lastName : { type: String },
            primaryLocation : { 
                coords : {
                    lat : {type: String},
                    lng : {type: String}
                },
                address : {type: String}
             }
        },
        contactInformation : {
            primaryEmail : { type: String },
            secondaryEmails : { type: Array },
            primaryPhoneNum : { type: String },
            secondaryPhoneNums : { type: Array }
        },
        userVerification : {
            status : {
                type:String, 
                enum : ["NotVerified","Pending","Verified"],
                required: true,
                default: "NotVerified"
            },
            captures : {
                idFront : {type: String},
                idBack :{type: String},
                selfie : {type:String}
            }
        }
    },
    lists : {type:Array},
    userProfile : {
        about : {type: String},
        memberFrom : {type: String, default : moment().format('MMMM Do YYYY')},
        lastTimeOnline : {type: String},
        rating : {type: Number},
        reviews : {type: Array}
    }
}, {timestamps:true}
)
const User = mongoose.model('User', userSchema);
module.exports = User