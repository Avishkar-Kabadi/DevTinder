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

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());


app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj instanceof Object) {
            for (let key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            }
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    next();
});

app.use("/api/", apiLimiter);
app.use("/auth/", apiLimiter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
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

io.on("connection", (socket) => {
    dbgr("⚡ User connected:", socket.id);
    socket.on("joinUser", (userId) => {
        if (userId) socket.join(userId);
    });
    socket.on("joinConversation", (id) => {
        if (id) socket.join(id);
    });
    socket.on("sendMessage", ({ conversationId, sender, photoUrl, receiverId, message }) => {
        if (conversationId) socket.to(conversationId).emit("receiveMessage", message);
        if (receiverId) socket.to(receiverId).emit("newMessageNotification", { message, sender, photoUrl });
    });
    socket.on("disconnect", () => dbgr("❌ User disconnected"));
});

const port = process.env.BREVO_API_KEY || config.get('PORT') || 5000
server.listen(port, () => dbgr(`🚀 Server running at http://localhost:${port}`));