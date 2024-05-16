const express = require("express");
const val = express.Router();
const path = require("path");
const fs = require("fs");

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

// Function to read values from the JSON file
function readValuesFromFile(callback) {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) {
            console.error("Error in reading from db:", err);
            return callback(err);
        }
        const values = JSON.parse(jsonString);
        callback(null, values);
    });
}

// Routes
val.get("/api/values", async (req, res) => {
    readValuesFromFile((err, values) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json({
            totalValues: values.length,
            values,
        });
    });
});

val.post("/api/values", async (req, res) => {
    const body = req.body;

    // Check if body is an object
    if (typeof body !== 'object') {
        return res.status(400).json({ error: "Request body must be an object" });
    }

    // Check if required fields are present
    if (!('crop' in body) || !('N' in body) || !('P' in body) || !('K' in body) || !('pH' in body) || !('temperature' in body) || !('humidity' in body)) {
        return res.status(400).json({ error: "Request body is missing required fields" });
    }

    // Combine new data with existing data
    readValuesFromFile((err, existingValues) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }

        const newData = {
            crop: body.crop,
            N: body.N,
            P: body.P,
            K: body.K,
            pH: body.pH,
            temperature: body.temperature,
            humidity: body.humidity,
        };

        const combinedData = [...existingValues, newData];

        // Write combined data to JSON file
        fs.writeFile(DB_PATH, JSON.stringify(combinedData), (err) => {
            if (err) {
                console.error("Error in updating db:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json({
                message: "Value saved",
                value: newData,
            });
        });
    });
});

module.exports = val;
