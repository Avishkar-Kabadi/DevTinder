


const jwt = require('jsonwebtoken');

const generateToken = (user) => {

    return jwt.sign({ userid: user._id }, process.env.JWT_SECRET || "devtinder_secret", { expiresIn: "7d" })

}


module.exports = generateToken;