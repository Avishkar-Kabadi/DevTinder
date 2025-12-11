const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const DB = require('./config/mongoose_connection');
const config = require('config');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());


app.use(cors({
    origin: "https://dev-t-inder.netlify.app/",
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
        origin: "https://dev-t-inder.netlify.app/",
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
    console.log("⚡ User connected:", socket.id);

    socket.on("joinUser", (userId) => {
        if (!userId) return;
        socket.join(userId);
        console.log(`User ${socket.id} joined USER ROOM: ${userId}`);
    });

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined CONVERSATION ROOM: ${conversationId}`);
    });

    socket.on("sendMessage", ({ conversationId, receiverId, message }) => {
        if (conversationId) {
            socket.to(conversationId).emit("receiveMessage", message);
        }
        if (receiverId) {
            socket.to(receiverId).emit("newMessageNotification", message);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});

const port = config.get('PORT') || 5000;
server.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));