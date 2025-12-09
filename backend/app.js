const express = require('express');
const DB = require('./config/mongoose_connection');
const flash = require('connect-flash');
const dbgr = require("debug")("development:server");
const config = require('config')
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());



const authRoutes = require('./routes/authRoutes');
app.use("/auth", authRoutes);

app.get('/', (req, res) => {
    res.send("Hello World");

});

const port = config.get('PORT');

app.listen(port, () => {
    dbgr(`server is running at http://localhost:${port}`);
});
