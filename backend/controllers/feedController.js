const dbgr = require("debug")("development:Feed");

const postModel = require('../models/postModel');
const ConnectionRequest = require('../models/connectionRequestModel');
const { redisClient, isRedisReady } = require('../config/redis');

/**
 * GET /api/feed
 * Returns posts from the logged-in user's accepted connections only.
 * Results are cached in Redis for 3 minutes.
 */
module.exports.fetchFeed = async (req, res) => {
    try {
        const currentId = req.user._id;
        const cacheKey = `feed:${currentId}`;

        // Attempt to fetch from Redis Cache ONLY if redis is ready
        if (isRedisReady && isRedisReady()) {
            try {
                const cachedFeed = await redisClient.get(cacheKey);
                if (cachedFeed) {
                    return res.status(200).json({
                        message: "Feed-data fetched from Cache",
                        feed: JSON.parse(cachedFeed)
                    });
                }
            } catch (redisError) {
                dbgr("Redis Cache Error:", redisError.message);
            }
        }

        // Fetch all accepted connections
        const connections = await ConnectionRequest.find({
            $or: [{ senderId: currentId }, { receiverId: currentId }],
            status: "accepted"
        });

        const connectionIds = connections.map(conn =>
            conn.senderId.toString() === currentId.toString() ? conn.receiverId : conn.senderId
        );

        const feed = await postModel.find({ owner: { $in: connectionIds } })
            .sort({ createdAt: -1 })
            .populate("owner", "firstName lastName photoUrl username");

        if (isRedisReady && isRedisReady()) {
            try {
                await redisClient.setex(cacheKey, 180, JSON.stringify(feed));
            } catch (redisError) {
                dbgr("Redis Set Error:", redisError.message);
            }
        }

        return res.status(200).json({ message: "Feed-data fetched", feed });

    } catch (error) {
        dbgr("Fetch Feed Error:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};