const express = require("express");
const val = express.Router();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

// Constants
const DB_PATH = path.resolve("db.json");

// Ensure the JSON file exists, create it if it doesn't
if (!fs.existsSync(DB_PATH)) {
    try {
        fs.writeFileSync(DB_PATH, '[]');
        console.log("db.json created successfully");
    } catch (error) {
        console.error("Error creating db.json:", error);
    }
}

// Middleware to parse JSON bodies
val.use(bodyParser.json());

// Middleware to send signal to Arduino that sensor data can be sent
val.get("/api/values/sensor-ready", (req, res) => {
    res.status(200).send("Ready for sensor data");
});

// Route to get all values
val.get("/api/values", async (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) {
            console.log("Error in reading from db:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        let values = JSON.parse(jsonString);
        res.status(200).json({
            totalValues: values.length,
            values,
        });
    });
});

// Route to receive sensor data and app data
val.post("/api/values", async (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) {
            console.log("Error in reading from db:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        let body = req.body;
        let valuesArr = []; // Initialize an empty array

        let obj = {
            crop: body.crop,
            N: body.N,
            P: body.P,
            K: body.K,
            pH: body.pH,
            temperature: body.temperature,
            humidity: body.humidity,
        };

        valuesArr.push(obj); // Add the new data to the array

        fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
            if (err) {
                console.log("Error in updating db:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            res.status(200).json({
                message: "Values saved",
                value: valuesArr[valuesArr.length - 1],
            });
        });
    });
});

module.exports = val;
