const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const val = require('./routes/values');
const viewresult = require('./routes/viewresult');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(val);
app.use(viewresult);
const DB = "mongodb+srv://plantect:plantect@cluster0.mfnsagy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(DB)
    .then(() => {
        console.log("Connection Successful");
    })
    .catch((e) => {
        console.log(e);
    });

app.listen(PORT, "0.0.0.0", () => {
    console.log(`connected at port ${PORT}`);
});