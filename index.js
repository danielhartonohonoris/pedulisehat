const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const TodoListItems = require("./models/TodoListItems");

const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`MongoDB connected at ${process.env.MONGO_URL}`);
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inisialisasi storage untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Menentukan direktori penyimpanan gambar
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Menentukan nama file
  },
});

// Inisialisasi upload multer
const upload = multer({ storage: storage });

// Handler untuk permintaan POST /process-login
app.post("/process-login", (req, res) => {
  // Mendapatkan data email dan password dari body permintaan
  const email = req.body.email;
  const password = req.body.password;

  // Di sini, Anda bisa melakukan validasi login, misalnya dengan memeriksa apakah email dan password valid
  // Anda juga bisa melakukan pengecekan pada database untuk mencocokkan email dan password

  // Contoh sederhana: Cek jika email dan password adalah "danielhartono@gmai.com" dan "1234567"
  if (email === "danielhartono@gmail.com" && password === "1234567") {
    // Jika login berhasil, Anda bisa mengirimkan respon OK (status code 200)
    res.status(200).send("Login successful!");
  } else {
    // Jika login gagal, Anda bisa mengirimkan respon Unauthorized (status code 401)
    res.status(401).send("Invalid email or password");
  }
});

// Endpoint untuk menambahkan obat baru ke database
app.post("/medicine", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newMedicine = new TodoListItems({
      title,
      description,
      image: req.file.filename, // Menyimpan nama file gambar ke basis data
    });
    await newMedicine.save();
    res.redirect("/medicine"); // Redirect kembali ke halaman medicine setelah menyimpan data
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan obat");
  }
});

// EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Menampilkan halaman login terlebih dahulu
app.get("/", (req, res) => {
  res.render("loginform.ejs");
});

// Menangani proses login
app.post("/login", (req, res) => {
  // Anda bisa menambahkan logika validasi email dan password di sini
  const { email, password } = req.body;

  // Contoh: Validasi sederhana
  if (email === "danielhartono@gmail.com" && password === "1234567") {
    // Jika kredensial valid, arahkan pengguna ke halaman index
    res.redirect("/home");
  } else {
    // Jika kredensial tidak valid, tampilkan kembali halaman login dengan pesan error
    res.render("loginform.ejs", { error: "Email atau password salah." });
  }
});

// Halaman index
app.get("/home", (req, res) => {
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

///////////INFORMATION//////////////
app.post("/information", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newMedicine = new TodoListItems({
      title,
      description,
      image: req.file.filename, // Menyimpan nama file gambar ke basis data
    });
    await newMedicine.save();
    res.redirect("/information"); // Redirect kembali ke halaman medicine setelah menyimpan data
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});
app.get("/information", async (req, res) => {
  try {
    // Ambil data todoListItems dari basis data MongoDB
    const todoListItems = await TodoListItems.find(); // Sesuaikan dengan model dan nama koleksi Anda

    // Render halaman medicine.ejs dan lewati data todoListItems
    res.render("information.ejs", { todoListItems });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman medicine");
  }
});

////////////////////////////////////////

////////OWNER///////////////////////////

app.get("/owner", (req, res) => {
  res.render("owner.ejs");
});

////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const path = require("path");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


