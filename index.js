const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const val = require('./routes/values');
const viewresult = require('./routes/viewresult');
const cors = require('cors');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(authRouter);
app.use(val);
app.use(viewresult);
app.use(bodyParser.json());
const DB = "mongodb+srv://plantect:plantect@cluster0.9dllm1w.mongodb.net/?retryWrites=true&w=majority";

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