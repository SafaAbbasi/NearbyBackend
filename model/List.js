const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = new Schema({
    status : {type: String, default:"Pending"},
    serviceProvider : {
        id: {type : String},
        fullName : {type : String}
    },
    category : {type: String, required: true},
    subCategory : {type: String},
    details : {
        title:{type: String},
        description: {type: String},
        tags : {type: Array}
    },
    uploads : {type: Array},
    contacts : {
        phoneNum : {type: String},
        location: {
            coords:{
                lat:{type:String},
                lng:{type:String}
            },
            address : {type:String}
        },
        contactVia : {
            type:String,
            enum : ['chatOnly', "call"],
        }
    }
},
{timestamps:true}
)

const List = mongoose.model("List", listSchema)

module.exports = {
    List
}