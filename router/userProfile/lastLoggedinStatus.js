const router = require('express').Router()

const passport = require('passport');
require('../../configurations/verifyToken');
const moment = require('moment');
const { successMsg,errorMsg } = require('../../model/Logs');
const User = require('../../model/User');

router.put('/', passport.authenticate('jwt', { session: false }), async (req,res)=>{
    try {
        let user = await User.findById(req.user._id);
        if(user){
            user.userProfile.lastTimeOnline = moment().format('MM Do YY, h:mm a');
            await user.save();
            return res.json({
                message : await successMsg(651,req.user.language), 
                lastTimeOnline : user.userProfile.lastTimeOnline
            })
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
})
module.exports = router