const express = require("express");
const val = express.Router();
const path = require("path");
const fs = require("fs");

//constants
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

// Routes
val.get("/api/values", async (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) return console.log("Error in reading from db");
        let values = JSON.parse(jsonString);
        res.status(200).json({
            totalValues: values.length,
            values,
        });
    });
});

val.post("/api/values", async (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) return console.log("Error in reading from db");

        let body = req.body;
        if (!Array.isArray(body)) {
            return res.status(400).json({ error: "Expected an array of objects" });
        }

        let appData = body[0];  // Assuming app data is the first element
        let sensorData = body[1];  // Assuming sensor data is the second element

        // Check for required fields in sensor data
        if (sensorData.temperature === undefined || sensorData.humidity === undefined) {
            return res.status(400).json({ error: "Missing required fields: 'temperature' or 'humidity'" });
        }

        let obj = {
            crop: appData.crop,
            N: appData.N,
            P: appData.P,
            K: appData.K,
            pH: appData.pH,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
        };

        // Overwrite the array with the new object
        let valuesArr = [obj];

        fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
            if (err) return console.log("Error in updating db");
            res.status(200).json({
                message: "Values saved",
                value: obj,
            });
        });
    });
});

module.exports = val;
