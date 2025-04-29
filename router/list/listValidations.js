const User = require("../../model/User");
const { errorMsg } = require("../../model/Logs");
const { discardImage } = require("./uploadListImages");

module.exports.listValidations = async (req,res,next) => {
     let regex = /^[a-zA-Z ]*$/;

    if(!req.body.category){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(900,req.user.language)})
        return res.send("category Required")
    }
    if(req.body.category.length >20 || req.body.category.length < 3){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(901,req.user.language)})
        return res.send("Category length should be minimun 3 and maximum 20")
    }
    if(!regex.test(req.body.category)){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(902,req.user.language)})
        return res.send("No Special Character in category")
    }
    if(req.body.subCategory){
        if(req.body.subCategory.length >20 || req.body.subCategory.length < 3){
            discardImage(req,res,next);
            return res.status(400).json({message : await errorMsg(911,req.user.language)})
            return res.send("Sub-category length should be minimun 3 and maximum 20")
        }
        if(!regex.test(req.body.subCategory)){
            discardImage(req,res,next);
            return res.status(400).json({message : await errorMsg(912,req.user.language)})
            return res.send("No Special Character in subCategory")
        }
    }
    
    if(!req.body.title){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(904,req.user.language)})
        return res.send("Title is required")
    }
    if(req.body.title.length < 20 || req.body.title.length > 70){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(903,req.user.language)})
        return res.send("title length error")
    }
    if(!req.body.description){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(905,req.user.language)})
        return res.send("Description is required")
    }
    if(req.body.description.length < 70 || req.body.description.length > 500){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(906,req.user.language)})
        return res.send("Description length error")
    }
    
    if(!req.body.tags || req.body.tags.length === 0){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(913, req.user.language)})
        return res.send("No Tags Selected")
    }

    req.body.tags = await req.body.tags.filter(item => item.length !== 0)

    if(req.body.tags.length > 5){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(907,req.user.language)})
        return res.send("Max 5 tags allowed")
    }
    let foundLengthError = await req.body.tags.find(item => item.length < 3)
    if(foundLengthError){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(908,req.user.language)})
        return res.send("Tag length error")
    }
    req.body.phoneNum = req.body.phoneNum ? req.body.phoneNum.replace(/\s/g,'') : undefined;

    if(!req.body.phoneNum){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(909,req.user.language)})
        return res.send("Phone Number is requried")
    }
    if(isNaN(req.body.phoneNum) || req.body.phoneNum.length !== 11){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(811,req.user.language)})
        return res.send("invalid phoneNum")
    }

    let user = await User.findById(req.user._id);
    
    if(user){
        let phoneExists = await user.profile.contactInformation.secondaryPhoneNums.find(item => item === req.body.phoneNum)
        if(!phoneExists && user.profile.contactInformation.primaryPhoneNum !== req.body.phoneNum){
            discardImage(req,res,next);
            return res.status(404).json({message : await errorMsg(814,req.user.language)})
            return res.send("this phone Num doesn\'t exist")
        }
    }

    if(!req.body.contactVia || (req.body.contactVia !== "chatOnly" && req.body.contactVia !== "call")){
        discardImage(req,res,next);
        return res.status(400).json({message : await errorMsg(910,req.user.language)})
        return res.send("Anyone of the contact type should be selected")
    }
    next();
}