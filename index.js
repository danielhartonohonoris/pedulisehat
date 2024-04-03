const express = require("express");
const app = express();
const path = require("path");
const port = 3100;

//iki ejs

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/medicine", (req, res) => {
    res.render("medicine.ejs");
});

app.get("/owner", (req, res) => {
    res.render("owner.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});