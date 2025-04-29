const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

try {
    mongoose.connect(
        process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify : false
    }, () => { console.log("Connected to MongoDB"); })

} catch (err) {
    console.log(err);
}
module.exports = mongoose