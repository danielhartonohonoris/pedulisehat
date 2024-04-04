const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const TodoListItems = require("./models/TodoListItems");

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log(`MongoDB connected at ${process.env.MONGO_URL}`);
}).catch((err) => {
    console.log(err.message);
});

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/todolistitems", require("./routes/api/todolistitems"));

// Inisialisasi storage untuk multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Menentukan direktori penyimpanan gambar
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Menentukan nama file
    }
});

// Inisialisasi upload multer
const upload = multer({ storage: storage });

// Endpoint untuk menambahkan obat baru ke database
app.post("/medicine", upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newMedicine = new TodoListItems({
            title,
            description,
            image: req.file.filename // Menyimpan nama file gambar ke basis data
        });
        await newMedicine.save();
        res.redirect("/medicine"); // Redirect kembali ke halaman medicine setelah menyimpan data
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat menyimpan obat");
    }
});

// EJS
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/medicine", async (req, res) => {
    try {
        // Ambil data todoListItems dari basis data MongoDB
        const todoListItems = await TodoListItems.find(); // Sesuaikan dengan model dan nama koleksi Anda

        // Render halaman medicine.ejs dan lewati data todoListItems
        res.render("medicine.ejs", { todoListItems });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat memuat halaman medicine");
    }
});

app.get("/owner", (req, res) => {
    res.render("owner.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
