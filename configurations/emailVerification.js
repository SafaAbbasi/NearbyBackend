const nodemailer = require("nodemailer");
const { successMsg, errorMsg } = require("../model/Logs");
// const SMTPTransport = require("nodemailer/lib/smtp-transport");

function sendEmailVerificationCode(req,res,next){
    
    req.body.emailOrPhone = req.body.emailOrPhone.replace(/\s/g,'')
    if(!isNaN(req.body.emailOrPhone)){
        return next();
    }
    let randomCode = `N-${Math.floor(100000 + Math.random() * 900000)}`
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: process.env.USER_NAME_GMAIL,
            pass: process.env.PASSWORD_GMAIL
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions = {
        from:"testnearby561@gmail.com",
        to: req.body.emailOrPhone,
        subject: "Testing",
        html: `<br/><h1 style='color:green'>NearBy</h1>
                <b>${randomCode}</b>
                is you NearBy verification code`
    }
    transporter.sendMail(mailOptions,async (err,data)=>{
        
        req.session.tries = req.session.tries ? req.session.tries + 1 : 1;

        if(req.session.tries > 3){
            return res.status(403).json({message : await errorMsg(825,req.params.lng)})
        }
        
        if(err){
            console.log("Error occured", err);
            return res.json(err)
        }else{
            req.session.verification_code = randomCode;
            req.session.user = req.body;
            return res.json({ 
                message : await successMsg(717,req.params.lng),
                verification_code : req.session.verification_code
            })
        }
    })
}


function addEmailVerification(req,res,next){
    req.body.secondaryEmail = req.body.secondaryEmail.replace(/\s/g,'')
    if(!isNaN(req.body.secondaryEmail)){
        return next();
    }
    let randomCode = `N-${Math.floor(100000 + Math.random() * 900000)}`
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: process.env.USER_NAME_GMAIL,
            pass: process.env.PASSWORD_GMAIL
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let mailOptions = {
        from:"testnearby561@gmail.com",
        to: req.body.secondaryEmail,
        subject: "Testing",
        html: `<br/><h1 style='color:green'>NearBy</h1>
                <b>${randomCode}</b>
                is you NearBy verification code`
    }
    transporter.sendMail(mailOptions,async (err,data)=>{

        req.session.tries = req.session.tries ? req.session.tries + 1 : 1;

        if(req.session.tries > 3){
            return res.status(403).json({message : await errorMsg(825,req.user.language)})
        }

        if(err){
            console.log("Error occured", err);
            return res.json(err)
        }else{            
            req.session.verification_code = randomCode;
            req.session.secondaryEmail = req.body.secondaryEmail;
            return res.json({ 
                message : await successMsg(717,req.user.language),
                verification_code : req.session.verification_code
            })
        }
    })
}

module.exports = {
    sendEmailVerificationCode : sendEmailVerificationCode,
    addEmailVerification : addEmailVerification
}
