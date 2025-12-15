const dbgr = require("debug")("development:Auth")
const userModel = require('../models/userModel');
const blacklistModel = require('../models/blackListTokenModel');
const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");


module.exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        const token = generateToken(newUser);
        const userObj = newUser.toObject();
        const { password: pwd, ...userWithoutPassword } = userObj;

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(201).json({
            message: "User Account Created Successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        dbgr("Register Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Both Email and Password are required!" });
    }

    try {
        const user = await userModel.findOne({ email });



        if (!user) return res.status(401).json({ message: "Invalid Credentials" });

        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(401).json({ message: "Invalid Credentials" });

        const token = generateToken(user);

        const userObj = user.toObject();
        const { password: pwd, ...userWithoutPassword } = userObj;

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
        });




        return res.status(200).json({
            message: "User Logged In Successfully",
            user: userWithoutPassword
        })


    } catch (error) {
        dbgr("Register Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports.logoutUser = async (req, res) => {
    const token = req.cookies?.token;

    try {
        if (token) {
            await blacklistModel.create({ token });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });

        return res.status(200).json({ message: "User Logout Successfully" });

    } catch (error) {
        dbgr("Logout Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.updateProfile = async (req, res) => {
    try {
        const { about, gender, skills, age } = req.body;

        const skillsArray = typeof skills === "string" ? JSON.parse(skills) : skills;

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
                    age,
                    about,
                    gender,
                    skills: skillsArray,
                    ...(photoUrl && { photoUrl }),
                    isProfileCompleted: true,
                },
                { new: true }
            )
            .select("-password");

        return res.json({
            message: "Profile updated",
            user: updatedUser,
        });
    } catch (error) {
        dbgr("Update Profile", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports.getUserProfile = async (req, res) => {
    return res.status(200).json({ message: "User Profile", user: req.user });

}