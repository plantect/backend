const express = require("express");
const val = express.Router();
const path = require("path");
const fs = require("fs");

//constants
const DB_PATH = path.resolve("db.json");

// Ensure the JSON file exists, create it if it doesn't
if (!fs.existsSync(DB_PATH)){
    try {
        fs.writeFileSync(DB_PATH, '[]');
        console.log("db.json created successfully");
    } catch (error) {
        console.error("Error creating db.json:", error);
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
            return res.status(500).json({ error: "Error parsing JSON" });
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
//             // crop: body.crop,
//             // N: body.N,
//             // P: body.P,
//             // K: body.K,
//             // pH: body.pH,
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
        let valuesArr = JSON.parse(jsonString);

        valuesArr = []

        // Create an object with the new values
        let obj = {
            humidity: req.body.humidity,
            temperature: req.body.temperature,
            timestamp: new Date().toISOString() // Add a timestamp for tracking
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