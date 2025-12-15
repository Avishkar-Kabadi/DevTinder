const mongoose = require('mongoose');
const config = require('config');
const dbgr = require("debug")("development:DB");





mongoose.connect(`${config.get('MONGODB_URL')}/devtinder`).then(() => {
    dbgr("DB Connected", config.get('MONGODB_URL'));
}).catch((error) => {
    dbgr(error);
});

module.exports = mongoose.connection;