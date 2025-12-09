const mongoose = require('mongoose');
const config = require('config');
const dbgr = require("debug")("development:DB");





mongoose.connect(`${config.get('MONGODB_URL')}/devtinder`).then(() => {
    dbgr("DB Connected");
}).catch((error) => {
    dbgr(error);
});

module.exports = mongoose.connection;