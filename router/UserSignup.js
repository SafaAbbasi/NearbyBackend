const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../model/User')
let jwt = require('../configurations/signToken');
const {  errorMsg, successMsg } = require('../model/Logs');
const {sendEmailVerificationCode} = require('../configurations/emailVerification')
const {sendPhoneNumVerificationCode} = require('../configurations/phoneNumVerification');

router.post('/register/:lng',signupValidations, sendEmailVerificationCode, sendPhoneNumVerificationCode)

router.post('/register/verify-user/:lng', async (req, res) => {

    if(!req.session.verification_code || !req.session.user){
        return res.status(403).json({
            message : await errorMsg(700,req.params.lng)
        })
    }

    if(req.body.verification_code !== req.session.verification_code){
        return res.status(400).json({
            message : await errorMsg(717,req.params.lng)
        })
    }
    
    req.session.user.emailOrPhone = req.session.user.emailOrPhone.replace(/\s/g,'')
    try {
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(req.session.user.password, salt);

        
        let local = {
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            password: hashedPassword
        }

        
        let newUser = new User({
            local: local
        })
        if (isNaN(req.session.user.emailOrPhone)) {
            newUser.profile.contactInformation.primaryEmail = req.session.user.emailOrPhone
        }else{
            newUser.profile.contactInformation.primaryPhoneNum = req.session.user.emailOrPhone
        }
        await newUser.signupStrategies.push("local");
        await newUser.save()
        req.session.destroy();
        res.status(200).json({
            message: await successMsg(714,req.params.lng)
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
        
    }
})

router.post('/login/:lng', loginValidations,async (req, res) => {

    User.findOne({$or:[
        {'profile.contactInformation.primaryEmail': req.body.emailOrPhone},
        {'profile.contactInformation.secondaryEmails': req.body.emailOrPhone},
        {'profile.contactInformation.primaryPhoneNum': req.body.emailOrPhone},
        {'profile.contactInformation.secondaryPhoneNums': req.body.emailOrPhone}
    ]}).then(async doc => {
                let isValid = await bcrypt.compare(req.body.password, doc.local.password)
                    try {
                        if (isValid) {
                            let token = jwt.sign(doc)
                            doc.userProfile.lastTimeOnline = "online";
                            await doc.save();
                            return res.status(200).json({ message : await successMsg(715, req.params.lng), token : token })
    
                        } if (!isValid) {
                            return res.status(400).json({  message : await errorMsg(710,req.params.lng) })
                        }
                        
                    } catch (error) {
                        console.log(error);
                    }
            
        })
        .catch(async err=>{
            return res.status(400).json({  message : await errorMsg(710,req.params.lng) })  
          })
})


async function signupValidations(req, res, next) {
    // console.log(req.body);
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!(req.body.firstName && req.body.lastName && req.body.emailOrPhone && req.body.password && req.body.confirmPassword)) {
        return res.status(400).json({ message:  await errorMsg(701,req.params.lng)})
    }
    if (req.body.firstName.length < 3 || req.body.lastName.length < 3) {
        return res.status(422).json({ message:  await errorMsg(702,req.params.lng) })
    }
    if (req.body.firstName === req.body.lastName) {
        return res.status(422).json({ message:  await errorMsg(703,req.params.lng) })
    }
    if (isNaN(req.body.emailOrPhone)) {
        if (!emailRegexp.test(req.body.emailOrPhone)) {
            return res.status(422).json({ message:  await errorMsg(704,req.params.lng) })
        }
    }
    if (!isNaN(req.body.emailOrPhone)) {
        if (req.body.emailOrPhone.replace(/\s/g,'').length != 11) {
            return res.status(422).json({ message:  await errorMsg(705,req.params.lng) })
        }
    }
    if (req.body.password.length < 8) {
        return res.status(422).json({ message: await errorMsg(706,req.params.lng) })
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: await errorMsg(707,req.params.lng) })
    }
    let isEmailOrPhone = await User.findOne(
        {
            $or: [
                {'profile.contactInformation.primaryPhoneNum' : req.body.emailOrPhone},
                {'profile.contactInformation.secondaryPhoneNums' : req.body.emailOrPhone},
                {'profile.contactInformation.primaryEmail' : req.body.emailOrPhone},
                {'profile.contactInformation.secondaryEmails' : req.body.emailOrPhone},
            ]
        }
    )
    if (isEmailOrPhone && isNaN(req.body.emailOrPhone)) {
        return res.status(409).json({
            message: await errorMsg(711,req.params.lng)
        })
    }
    if (isEmailOrPhone && !isNaN(req.body.emailOrPhone)) {
        return res.status(409).json({
            message: await errorMsg(712,req.params.lng)
        })
    }
    next();
}

async function loginValidations(req, res, next) {
    // console.log(req.body);
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!req.body.emailOrPhone) {
        return res.status(400).json({ message: await errorMsg(708, req.params.lng) })
    }

    if (isNaN(req.body.emailOrPhone.replace(/\s/g,''))) {
        if (!emailRegexp.test(req.body.emailOrPhone)) {
            return res.status(422).json({ message: await errorMsg(704, req.params.lng) })
        }
    }
    if (!isNaN(req.body.emailOrPhone.replace(/\s/g,''))) {
        if ( req.body.emailOrPhone.replace(/\s/g,'').length != 11) {
            return res.status(422).json({ message: await errorMsg(705, req.params.lng) })
        }
    }
    if (!req.body.password) {
        return res.status(400).json({ message: await errorMsg(713, req.params.lng) })
    }    
    if (req.body.password.length < 8) {
        return res.status(400).json({ message: await errorMsg(706, req.params.lng) })
    }
    next();
}
module.exports = router
