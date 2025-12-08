const express = require('express');
const db = require('./config/mongoose_connection');
const app = express()



app.get('/', (req, res) => {
    res.send("Hello World");
});


app.listen(5000, () => {
    console.log(`server is running at port: http://localhost:5000)`);

});