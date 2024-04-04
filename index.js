const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log(`MongoDB connected at ${process.env.MONGO_URL}`);
}).catch((err) => {
    console.log(err.message);
});

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/todolistitems", require("./routes/api/todolistitems"));

//ejs

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