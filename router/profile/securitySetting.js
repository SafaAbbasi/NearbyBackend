const router = require('express').Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { errorMsg, successMsg } = require('../../model/Logs');
const User = require('../../model/User');
require('../../configurations/verifyToken')

router.get('/', passport.authenticate('jwt', { session: false }), async (req,res)=>{

    let user = await User.findById(req.user._id);
    let found = user.signupStrategies.find(e => e === "local");

    if(!found){
        return res.status(403).json({message : await errorMsg(821, req.user.language), strategies : user.signupStrategies})
    }
    return res.status(200).json({message : await successMsg(865,req.user.language), strategies : user.signupStrategies})
})

async function securitySettingValidations(req, res, next){
        
    if(!req.body.oldPassword){
        return res.status(400).json({message : await errorMsg(822,req.user.language)})
    }
    if(req.body.newPassword.length < 8){
        return res.status(400).json({message : await errorMsg(823,req.user.language)})
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return res.status(400).json({message : await errorMsg(824,req.user.language)})
    }
    let user = await User.findById(req.user._id);
    let found = user.signupStrategies.find(e => e === "local");

    if(!found){
        return res.status(403).json({message : await errorMsg(821, req.user.language), strategies : user.signupStrategies})
    }
    next();
}

router.post('/change-password', passport.authenticate('jwt', { session: false }), securitySettingValidations, async (req,res)=>{

    try {
        let user = await User.findById(req.user._id);

        let isMatched = await bcrypt.compare(req.body.oldPassword, user.local.password);

        if(!isMatched){
            return res.status(400).json({message : await errorMsg(822, req.user.language)})
        }
        else{

            let salt = await bcrypt.genSalt(10);
            let hashedNewPassword = await bcrypt.hash(req.body.newPassword,salt);

            user.local.password = hashedNewPassword;
            await user.save();

            return res.status(200).json({
                message : await successMsg(864, req.user.language)
            })

        }

    } catch (error) {
        return res.status(400).json(error)      
    }

})

module.exports = router