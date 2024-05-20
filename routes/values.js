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
} else {
    // Validate that the file contains a valid JSON array
    try {
        const data = fs.readFileSync(DB_PATH, 'UTF-8');
        JSON.parse(data);
    } catch (error) {
        console.error("Invalid JSON in db.json, reinitializing:", error);
        fs.writeFileSync(DB_PATH, '[]');
    }
}

//routes
// val.get("/api/values",async (req, res) => {
//     fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
//         if (err) return console.log("Error in reading from db");
//         let values = JSON.parse(jsonString);
//         res.status(200).json({
//             totalValues: values.length,
//             values,
//         });
//     });
// });

val.get("/api/values", (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) {
            console.error("Error in reading from db:", err);
            return res.status(500).json({ error: "Error in reading from db" });
        }
        let values;
        try {
            values = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            // Reinitialize db.json if it's corrupted
            fs.writeFileSync(DB_PATH, '[]');
            return res.status(500).json({ error: "Error parsing JSON. Reinitialized db.json." });
        }
        res.status(200).json({
            totalValues: values.length,
            values,
        });
    });
});

// val.post("/api/values",async (req, res) => {
//     fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
//         if (err) return console.log("Error in reading from db");
//         let body = req.body;
//         let valuesArr = JSON.parse(jsonString);

//         valuesArr = []
        
//         let obj = {
            // crop: body.crop,
            // N: body.N,
            // P: body.P,
            // K: body.K,
            // pH: body.pH,
//             //temperature: 25,
//             //humidity: 85,
//             temperature: body.temperature,
//             humidity: body.humidity,
//             timestamp: new Date().toISOString()
//         };
//         valuesArr.push(obj);
//         fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
//             if(err) return console.log("Error in updating db");
//             res.status(200).json({
//                 message: "Values saved",
//                 // value: valuesArr[valuesArr.length - 1]
//                 value: obj,
//             });
//         });
//     });
// });

val.post("/api/values", (req, res) => {
    fs.readFile(DB_PATH, "UTF-8", (err, jsonString) => {
        if (err) {
            console.error("Error in reading from db:", err);
            return res.status(500).json({ error: "Error in reading from db" });
        }
        let valuesArr;
        try {
            valuesArr = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            // Reinitialize db.json if it's corrupted
            fs.writeFileSync(DB_PATH, '[]');
            valuesArr = [];
        }

        // Validate the request body
        if (typeof req.body.humidity !== 'number' || typeof req.body.temperature !== 'number') {
            return res.status(400).json({ error: "Invalid data format" });
        }

        // Create an object with the new values
        let obj = {
            crop: req.body.crop,
            N: req.body.N,
            P: req.body.P,
            K: req.body.K,
            pH: req.body.pH,
            humidity: req.body.humidity,
            temperature: req.body.temperature,
        };
        valuesArr.push(obj); // Add new object to array

        fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
            if (err) {
                console.error("Error in updating db:", err);
                return res.status(500).json({ error: "Error in updating db" });
            }
            res.status(200).json({
                message: "Values saved",
                value: obj,
            });
        });
    });
});

module.exports = val;