const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Errors Schema
const ELogs = new Schema({
    errCode:{type:Number, unique:true},
    lng : { en : {type:String}, ur : {type:String}}
})

const ErrorLogs = mongoose.model('ErrorLogs',ELogs);


const errorMsg = async(code,language)=>{
    try {
        const responseMsg = await ErrorLogs.findOne({errCode:code});
        if(language === 'en'){
            return { 
                errCode:responseMsg.errCode, 
                desc:responseMsg.lng.en
            };
        }
        if(language === 'ur'){
            return { 
                errCode : responseMsg.errCode, 
                desc:responseMsg.lng.ur
            };
        }else{
            return {
                errCode : responseMsg.errCode,
                desc : "this language is not supported"
            }
        }
                
    } catch (error) {
        console.log(error);
    }   
    
}

// =====================================================================

// Success Schema
const SLogs = new Schema({
    successCode:{type:Number, unique:true},
    lng : { en : {type:String}, ur : {type:String}}
})

const SuccessLogs = mongoose.model('SuccessLogs', SLogs);


const successMsg = async(code,language)=>{
    try {
        const responseMsg = await SuccessLogs.findOne({successCode:code});
        if(language === 'en'){
            return { 
                successCode:responseMsg.successCode, 
                desc:responseMsg.lng.en
            };
        }
        if(language === 'ur'){
            return { 
                successCode : responseMsg.successCode, 
                desc:responseMsg.lng.ur
            };
        }else{
            return {
                successCode : responseMsg.successCode,
                desc : "this language is not supported"
            }
        }
                
    } catch (error) {
        console.log(error);
    }   
    
}

module.exports = {ErrorLogs, errorMsg, SuccessLogs, successMsg}