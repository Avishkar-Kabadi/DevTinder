const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const DB = require('./config/mongoose_connection');
const config = require('config');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const dbgr = require("debug")("development:Server")


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

const authRoutes = require('./routes/authRoutes');
const feedRoutes = require('./routes/feedRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use("/auth", authRoutes);
app.use("/api", feedRoutes);
app.use("/api/chat", chatRoutes);

app.get('/', (req, res) => res.send("Hello World"));

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

io.on("connection", (socket) => {
    dbgr("⚡ User connected:", socket.id);

    socket.on("joinUser", (userId) => {
        if (!userId) return;
        socket.join(userId);
        dbgr(`User ${socket.id} joined USER ROOM: ${userId}`);
    });


    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        dbgr(`User ${socket.id} joined CONVERSATION ROOM: ${conversationId}`);
    });

    socket.on("sendMessage", ({ conversationId, sender, photoUrl, receiverId, message }) => {
        if (conversationId) {
            socket.to(conversationId).emit("receiveMessage", message);
        }

        if (receiverId) {
            socket.to(receiverId).emit("newMessageNotification", { message, sender, photoUrl });
            dbgr(`Emitted newMessageNotification to user ${receiverId}`);
        }
    });

    socket.on("disconnect", () => {
        dbgr("❌ User disconnected:", socket.id);
    });
});

const port = config.get('PORT') || 5000;
server.listen(port, () => dbgr(`🚀 Server running at http://localhost:${port}`));