const express = require("express");
const viewresult = express.Router();
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const DB_PATH = path.resolve("db.json");

viewresult.post('/api/viewresult', (req, res) => {
    fs.readFile(DB_PATH, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading model file');
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            axios.post('https://plantect.pythonanywhere.com/', jsonData)
                .then(response => {
                    console.log(response.data);
                    res.json(response.data);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Error making predictions with the classifier');
                });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error parsing JSON data');
        }
    });
});

module.exports = viewresult;
