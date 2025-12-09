const blacklistToken = require('../models/blackListTokenModel');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - Please Login" });
        }

        const blacklisted = await blacklistToken.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ message: "Unauthorized - Blacklisted Token" });
        }

        const decoded = jwt.verify(token, "shshhdjdj");

        if (!decoded || !decoded.userid) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await userModel.findById(decoded.userid).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Unauthorized - Token invalid or expired",
            error: error.message,
        });
    }
};

module.exports = isLoggedIn;
