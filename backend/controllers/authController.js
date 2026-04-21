const dbgr = require("debug")("development:Auth")
const userModel = require('../models/userModel');
const blacklistModel = require('../models/blackListTokenModel');
const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const otpGenerator = require('otp-generator');
const { sendEmail } = require('../utils/mailer');
const ConnectionRequest = require('../models/connectionRequestModel');
const {getOtpEmailTemplate} = require('../utils/emailTemplate');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
};

const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
};

const attachConnectionData = async (userObj) => {
    if (!userObj || !userObj._id) return userObj;
    const userId = userObj._id.toString();

    const allReqs = await ConnectionRequest.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
    });

    const connectionsIds = [];
    const requestsIds = [];
    const sentRequestsIds = [];

    allReqs.forEach(req => {
        if (req.status === "accepted") {
            connectionsIds.push(req.senderId.toString() === userId ? req.receiverId : req.senderId);
        } else if (req.status === "interested") {
            if (req.receiverId.toString() === userId) {
                requestsIds.push(req.senderId);
            } else {
                sentRequestsIds.push(req.receiverId);
            }
        }
    });

    return {
        ...userObj,
        connections: connectionsIds,
        requests: requestsIds,
        sentRequests: sentRequestsIds
    };
};


module.exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ message: "Account already exists and is verified." });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        const hashedPassword = await bcrypt.hash(password, 10);


        try {
            await sendEmail(email,getOtpEmailTemplate(otp, "verification"));
        } catch (mailError) {
            dbgr("Email Service Error:", mailError);
            return res.status(503).json({
                message: "Email service is temporarily unavailable. Please try again later."
            });
        }


        await userModel.findOneAndUpdate(
            { email },
            {
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                otp,
                isVerified: false
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({ message: "OTP sent to email. Please verify." });

    } catch (error) {
        dbgr("Register Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });

    if (!user || user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
        message: "Email verified successfully",
        user: { email: user.email, firstName: user.firstName }

    });
};

module.exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
        return res.status(400).json({ message: "Email/Username and Password are required!" });
    }

    try {
        const user = await userModel.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });



        if (!user) return res.status(401).json({ message: "Invalid Credentials" });

        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(401).json({ message: "Invalid Credentials" });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Email not verified. Please complete OTP verification." });
        }

        const token = generateToken(user);

        let userObj = user.toObject();
        userObj = await attachConnectionData(userObj);

        const { password: pwd, ...userWithoutPassword } = userObj;

         res.cookie("token", token, cookieOptions);





        return res.status(200).json({
            message: "User Logged In Successfully",
            user: userWithoutPassword
        })


    } catch (error) {
        dbgr("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports.logoutUser = async (req, res) => {
    const token = req.cookies?.token;

    try {
        if (token) {
            await blacklistModel.create({ token });
        }

        res.clearCookie("token", clearCookieOptions);

        return res.status(200).json({ message: "User Logout Successfully" });

    } catch (error) {
        dbgr("Logout Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.updateProfile = async (req, res) => {
    try {
        const { about, gender, age, firstName, lastName, username } = req.body;

        let photoUrl = undefined;

        if (req.file) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "user_profiles",
            });

            photoUrl = cloud.secure_url;
        }

        const updatedUser = await userModel
            .findByIdAndUpdate(
                req.user._id,
                {
                    firstName,
                    lastName,
                    username,
                    age,
                    about,
                    gender,
                    ...(photoUrl && { photoUrl }),
                    isProfileCompleted: true,
                },
                { new: true }
            )
            .select("-password");

        let userObj = updatedUser.toObject();
        userObj = await attachConnectionData(userObj);

        return res.json({
            message: "Profile updated",
            user: userObj,
        });
    } catch (error) {
        dbgr("Update Profile", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports.getUserProfile = async (req, res) => {
    let userObj = req.user.toObject ? req.user.toObject() : req.user;
    userObj = await attachConnectionData(userObj);
    return res.status(200).json({ message: "User Profile", user: userObj });
}

module.exports.searchUser = async (req, res) => {
    try {
        const { query } = req.query;

        // 1. If no query is provided, return an empty array instead of crashing
        if (!query) {
            return res.status(200).json({ message: "No query provided", users: [] });
        }

        // 2. Perform the search
        const users = await userModel.find({
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
            ],
        }).select("-password -email -otp -isVerified");

        // 3. Attach connection status (Interested/Accepted) for each found user
        // This ensures the Search UI knows if you are already friends
        const usersWithConnectionData = await Promise.all(
            users.map(async (user) => {
                let userObj = user.toObject();
                return await attachConnectionData(userObj);
            })
        );

        return res.status(200).json({
            message: "Users found",
            users: usersWithConnectionData
        });
    } catch (error) {
        dbgr("Search Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * POST /auth/resend-otp
 * Generates a fresh OTP for users whose previous OTP has expired or was lost.
 */
module.exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found for this email" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        user.otp = otp;
        await user.save();

        await sendEmail(email, "Your New Verification Code", `Your new OTP is: ${otp}`);

        return res.status(200).json({ message: "New OTP sent to your email" });

    } catch (error) {
        dbgr("Resend OTP Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /auth/user/:id
 * Fetches a user's public profile by ID.
 * Used so that UserProfile page can load even on hard-reload (when route state is gone).
 */
module.exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await userModel
            .findById(userId)
            .select("-password -email -otp -isVerified");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let userObj = user.toObject();
        userObj = await attachConnectionData(userObj);

        return res.status(200).json({ message: "User profile", user: userObj });
    } catch (error) {
        dbgr("Get User By ID Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};