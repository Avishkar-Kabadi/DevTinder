


const jwt = require('jsonwebtoken');

const generateToken = (user) => {

    return jwt.sign({ userid: user._id }, "shshhdjdj")

}


module.exports = generateToken;