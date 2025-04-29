const router = require('express').Router();
const passport= require('passport');
require('../../configurations/verifyToken');
const { errorMsg, successMsg } = require('../../model/Logs');

const User = require('../../model/User');

const {List} = require('../../model/List');

const moment = require('moment')

const setLoginStatus = require('./lastLoggedinStatus')
router.use('/set-last-login-status', setLoginStatus);

router.get('/details', passport.authenticate('jwt', { session: false }), (req,res)=>{

    try {

        let userDetails = {
            image : req.user.profile.profilePic,
            name : req.user.profile.accountInformation.displayName,
            primaryEmail : req.user.profile.contactInformation.primaryEmail,
            primaryPhoneNum : req.user.profile.contactInformation.primaryPhoneNum,
            primaryLocation : {
                coords : {
                    lat : req.user.profile.accountInformation.primaryLocation.coords.lat,
                    lng : req.user.profile.accountInformation.primaryLocation.coords.lng
                },
                address : req.user.profile.accountInformation.primaryLocation.address
            },
            about : "",
            memberFrom : req.user.userProfile.memberFrom,
            lastTimeLogin : req.user.userProfile.lastTimeOnline,
            verifications : {
                email : true,
                phone : true,
                ID : req.user.profile.userVerification.status,
            },
            ratingWithStars : 4.7
        }
    
        res.json(userDetails)
        
    } catch (error) {
        console.log(error);
        res.json(error)
    }
})

router.get('/listings', passport.authenticate('jwt', { session: false }),async (req,res)=>{

    try {
        let user = await User.findById(req.user._id);
        let lists = await user.lists;

        let responseLists = []

        for(i=0; i<lists.length; i++){
            let myList = await List.findById(lists[i])
            responseLists.push({
                listId : myList._id,
                image : myList.uploads,
                title : myList.details.title,
                description : myList.details.description,
                location : myList.contacts.location,
                rating : 4.5
            });
        }

        return res.status(200).json(responseLists)
        
    } catch (error) {
        console.log(error);
        return res.json(error)
    }

})

router.get('/rating-and-reviews',(req,res)=>{
    res.send("User Rating And Reviews")
})

module.exports = router