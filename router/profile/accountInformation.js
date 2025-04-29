
const router = require('express').Router();
const passport = require('passport');
require('../../configurations/verifyToken')

const { successMsg, errorMsg } = require('../../model/Logs')
const User = require('../../model/User');


router.get('/',  passport.authenticate('jwt', { session: false }), async (req, res)=>{

    res.status(200).json({message: await successMsg(859,req.user.language),accountInformation : await accountInfoResponse(req,res)})

})


// ===================================== Account Information (UPDATE) ======================================= //

async function accountInfoValidations(req,res,next){
    if(!(await req.body.firstName && req.body.lastName)){
        return res.status(400).json({message : await errorMsg(804,req.user.language)})
    }
    if(req.body.firstName === req.body.lastName){
        return res.status(422).json({ message : await errorMsg(703, req.user.language) })
    }
    if(req.body.firstName.length < 3 || req.body.lastName.length < 3){
        return res.status(403).json({message : await errorMsg(805,req.user.language)})
    }
    next(); 
}

router.patch('/update', passport.authenticate('jwt', { session: false }), accountInfoValidations, async (req,res) =>{
    try {
        let user = await User.findById(req.user._id);
    if(user){
        user.profile.accountInformation = {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            displayName : req.body.firstName+" "+req.body.lastName,
            primaryLocation : {
                coords : {
                    lat : req.body.lat,
                    lng : req.body.lng,                    
                },
                address : req.body.address
            }

        };
        await user.save();
        return res.status(200).json({message : await successMsg(860, req.user.language), accountInformation : await accountInfoResponse(req,res)});
    }

    } catch (error) {
        console.log(error);
        return res.json(error)
    }
})

async function accountInfoResponse(req,res){
    try {
        let user = await User.findById(req.user._id);
        if(user){
            let { firstName, lastName } = user.profile.accountInformation;
            if(firstName && lastName){

                return {account : user.profile.accountInformation, profilePic : user.profile.profilePic}
            }

            if(user.facebook.displayName || user.google.displayName){
                user.profile.accountInformation = {
                    firstName : await user.profile.accountInformation.displayName ? await user.profile.accountInformation.displayName.split(' ')[0] :
                                await user.facebook.displayName ? await user.facebook.displayName.split(' ')[0] : 
                                await user.google.displayName.split(' ')[0],

                    lastName : await user.profile.accountInformation.displayName ? await user.profile.accountInformation.displayName.split(' ')[1] : 
                                await user.facebook.displayName ? await user.facebook.displayName.split(' ')[1] : 
                                await user.google.displayName.split(' ')[1],

                    primaryLocation : await user.profile.accountInformation.primaryLocation ? user.profile.accountInformation.primaryLocation : "",
                    
                }
                await user.save();
                return {accountInformation : user.profile.accountInformation, profilePic : user.profile.profilePic}
            }
            if(!user.facebook.displayName && !user.google.displayName){
                user.profile.accountInformation = {
                    firstName : await user.profile.accountInformation.displayName ? user.profile.accountInformation.displayName.split(' ')[0] : user.local.firstName,
                    lastName : await user.profile.accountInformation.displayName ? user.profile.accountInformation.displayName.split(' ')[1] : user.local.lastName,
                    primaryLocation : await user.profile.accountInformation.primaryLocation ? user.profile.accountInformation.primaryLocation : ""
                }
                await user.save();
                return  {account : user.profile.accountInformation, profilePic : user.profile.profilePic}
            }
        }
    }
    catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = router