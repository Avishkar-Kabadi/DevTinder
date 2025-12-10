
const dbgr = require("debug")("development:Feed")

const userModel = require('../models/userModel');


module.exports.fetchFeed = async (req, res) => {
    try {

        // Write a logic to filterout your own connections and users which you've already sent request(i.e. Filterout users which have loggedIn users id in there requests :[])

        const data = await userModel.find().select('-password -isProfileCompleted -updatedAt -__v');
        if (!data) return res.status(400).json({ message: "Failed to fetch feed-data" });

        const filterData = data.filter(
            (user) => user._id.toString() !== req.user._id.toString()
        );



        return res.status(200).json({ message: "Feed-data fetched", data: filterData });
    } catch (error) {
        dbgr("Fetch Feed :", error.message)
        return res.status(500).json({ message: "Internal server error", error });
    }
}

module.exports.sendRequest = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        await userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { requests: _id } },
            { new: true }
        );

        return res.json({
            message: "Request sent successfully",
        });

    } catch (error) {
        dbgr("Send Request :", error.message)
        return res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports.fetchAllRequest = async (req, res) => {
    const { _id } = req.user;

    try {
        const user = await userModel.findById(_id).select("requests");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const requestData = await userModel.find({
            _id: { $in: user.requests }
        });

        return res.json({
            message: "Requests fetched successfully",
            requests: requestData
        });

    } catch (error) {
        dbgr("Fetch Requests :", error.message)
        return res.status(500).json({ message: "Internal server error", error });
    }
};


module.exports.acceptRequest = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        const user = await userModel.findById(_id).select("requests connections");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.requests.includes(userId)) {
            return res.status(400).json({ message: "Request does not exist" });
        }

        user.requests = user.requests.filter(
            (id) => id.toString() !== userId
        );

        if (!user.connections.includes(userId)) {
            user.connections.push(userId);
        }

        await user.save();


        await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: { requests: _id },
                $addToSet: { connections: _id },
            }
        );

        return res.status(200).json({
            message: "Request accepted successfully",
        });

    } catch (error) {
        dbgr("Accept Request :", error.message)
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.declineRequest = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        const user = await userModel.findById(_id).select("requests");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.requests.includes(userId)) {
            return res.status(400).json({ message: "Request does not exist" });
        }

        user.requests = user.requests.filter(
            (id) => id.toString() !== userId
        );
        await user.save();


        await userModel.findByIdAndUpdate(
            userId,
            { $pull: { requests: _id } }
        );

        return res.status(200).json({
            message: "Request declined successfully",
        });

    } catch (error) {
        dbgr("Decline request :", error.message)
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.removeConnection = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        await Promise.all([
            userModel.findByIdAndUpdate(
                _id,
                { $pull: { connections: userId } }
            ),
            userModel.findByIdAndUpdate(
                userId,
                { $pull: { connections: _id } }
            )
        ]);

        return res.status(200).json({ message: "Connection Removed" });

    } catch (error) {
        console.error("Remove Connection :", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};


module.exports.fetchAllConnections = async (req, res) => {
    const { _id } = req.user;

    try {
        const user = await userModel.findById(_id).select("connections");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connections = await userModel.find({ _id: { $in: user.connections } });

        return res.json({
            message: "Connections fetched successfully",
            connections
        });

    } catch (error) {
        dbgr("Fetch Connections :", error.message)
        return res.status(500).json({ message: "Internal server error", error });

    }
}