const express = require("express");
const val = express.Router();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

// Constants
const DB_PATH = path.resolve("db.json");
const SENSOR_DATA_PATH = path.resolve("sensor_data.json");

// Ensure the JSON files exist, create them if they don't
if (!fs.existsSync(DB_PATH)){
    try {
        fs.writeFileSync(DB_PATH, '[]');
        console.log("db.json created successfully");
    } catch (error) {
        console.error("Error creating db.json:", error);
    }
}

if (!fs.existsSync(SENSOR_DATA_PATH)){
    try {
        fs.writeFileSync(SENSOR_DATA_PATH, '{}');
        console.log("sensor_data.json created successfully");
    } catch (error) {
        console.error("Error creating sensor_data.json:", error);
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
        res.status(200).json(values);
    });
});

// Route to receive sensor data
val.post("/api/values/sensor", async (req, res) => {
    let body = req.body;

    // Save sensor data to a temporary file
    fs.writeFile(SENSOR_DATA_PATH, JSON.stringify(body), (err) => {
        if (err) {
            console.log("Error in saving sensor data:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.status(200).json({ message: "Sensor data saved" });
    });
});

// Route to receive app data and combine with sensor data
val.post("/api/values", async (req, res) => {
    let body = req.body;

    fs.readFile(SENSOR_DATA_PATH, "UTF-8", (err, sensorDataString) => {
        if (err) {
            console.log("Error in reading sensor data:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        let sensorData = JSON.parse(sensorDataString);

        // Combine app data with sensor data
        let obj = {
            crop: body.crop,
            N: body.N,
            P: body.P,
            K: body.K,
            pH: body.pH,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
        };

        let valuesArr = [obj]; // Ensure only one element in array

        fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
            if (err) {
                console.log("Error in updating db:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            res.status(200).json(valuesArr);
        });
    });
});

module.exports = val;
