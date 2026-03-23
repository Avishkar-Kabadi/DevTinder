const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const DB = require('./config/mongoose_connection');
const config = require('config');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const dbgr = require("debug")("development:Server");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


let CLIENT_URL = process.env.CLIENT_URL

let corsOptions = {
    origin:CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}
app.use(cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());


app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            });
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query);
    next();
});

app.use("/api/", apiLimiter);
app.use("/auth/", apiLimiter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOptions,
    transports: ["websocket", "polling"],
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const commentRoutes = require('./routes/commentRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use("/auth", authRoutes);
app.use("/api", feedRoutes);
app.use("/api", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/', (req, res) => res.send("API is active."));

const onlineUsersMap = new Map();

io.on("connection", (socket) => {
    dbgr("⚡ User connected:", socket.id);
    
    // Auto-join user room and track online status if userId is provided in auth
    const userId = socket.handshake.auth?.userId;
    if (userId) {
        socket.join(userId);
        if (!onlineUsersMap.has(userId)) {
            onlineUsersMap.set(userId, new Set());
        }
        onlineUsersMap.get(userId).add(socket.id);
        io.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
        dbgr(`👤 User ${userId} joined via socket ${socket.id}`);
    }

    socket.on("getOnlineUsers", () => {
        socket.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
    });
    
    // Kept for backward compatibility or explicit re-joins
    socket.on("joinUser", (id) => {
        if (id) {
            socket.join(id);
            if (!onlineUsersMap.has(id)) {
                onlineUsersMap.set(id, new Set());
            }
            onlineUsersMap.get(id).add(socket.id);
            io.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
        }
    });

    socket.on("joinConversation", (id) => {
        if (id) socket.join(id);
    });

    socket.on("sendMessage", ({ conversationId, sender, photoUrl, receiverId, message }) => {
        if (conversationId) socket.to(conversationId).emit("receiveMessage", message);
        if (receiverId) socket.to(receiverId).emit("newMessageNotification", { message, sender, photoUrl });
    });

    // WebRTC Signaling Relay Events
    socket.on("callUser", ({ userToCall, signalData, from, name, photoUrl, isVideo }) => {
        socket.to(userToCall).emit("incomingCall", { signal: signalData, from, name, photoUrl, isVideo });
    });

    socket.on("answerCall", (data) => {
        socket.to(data.to).emit("callAccepted", data.signal);
    });

    socket.on("iceCandidate", (data) => {
        socket.to(data.to).emit("iceCandidate", data.candidate);
    });

    socket.on("endCall", (data) => {
        socket.to(data.to).emit("callEnded");
    });

    socket.on("disconnect", () => {
        dbgr("❌ Socket disconnected:", socket.id);
        
        // Find and remove this specific socket from the user's set
        for (let [uId, socketSet] of onlineUsersMap.entries()) {
            if (socketSet.has(socket.id)) {
                socketSet.delete(socket.id);
                if (socketSet.size === 0) {
                    onlineUsersMap.delete(uId);
                    io.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
                    dbgr(`👤 User ${uId} is now offline`);
                }
                break;
            }
        }
    });
});

const port = process.env.PORT || config.get('PORT') || 5000
server.listen(port, () => dbgr(`🚀 Server running at http://localhost:${port}`));