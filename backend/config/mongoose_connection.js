const mongoose = require('mongoose');
const config = require('config');
const dbgr = require("debug")("development:DB");
require('dotenv').config();

mongoose.connect(`${process.env.MONGODB_URL}`).then(() => {
    dbgr("DB Connected", config.get('MONGODB_URL'));
}).catch((error) => {
    dbgr(error);
});

module.exports = mongoose.connection;