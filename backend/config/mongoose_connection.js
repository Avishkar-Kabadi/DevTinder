const mongoose = require('mongoose');


module.exports.mongoooseConnection = () => {
    try {
        mongoose.connect(``);
        console.log("DB Connected");

    } catch (error) {
        console.error(error);

    }
}