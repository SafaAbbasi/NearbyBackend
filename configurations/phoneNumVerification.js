const { successMsg, errorMsg } = require('../model/Logs');

async function sendPhoneNumVerificationCode(req,res,next){
    req.session.tries = req.session.tries ? req.session.tries + 1 : 1;

    if(req.session.tries > 3){
        return res.status(403).json({message : await errorMsg(825,req.params.lng)})
    }
    
    req.body.emailOrPhone = req.body.emailOrPhone.replace(/\s/g,'');

    let randomCode = `N-${Math.floor(100000 + Math.random() * 900000)}`

    req.session.verification_code = randomCode;

    req.session.user = req.body;

    return res.status(200).json({
        message : await successMsg(718, req.params.lng),
        verification_code : req.session.verification_code
    })
}

async function addPhoneNumVerification(req,res,next){
    
    req.session.tries = req.session.tries ? req.session.tries + 1 : 1;
    if(req.session.tries > 3){
        return res.status(403).json({message : await errorMsg(825,req.user.language)})
    }
    
    req.body.secondaryPhoneNum = req.body.secondaryPhoneNum.replace(/\s/g,'');

    let randomCode = `N-${Math.floor(100000 + Math.random() * 900000)}`

    req.session.verification_code = randomCode;
    req.session.secondaryPhoneNum = req.body.secondaryPhoneNum;

    return res.status(200).json({
        message : await successMsg(718, req.user.language),
        verification_code : req.session.verification_code
    })
}

module.exports  = {
    sendPhoneNumVerificationCode : sendPhoneNumVerificationCode,
    addPhoneNumVerification : addPhoneNumVerification
}
