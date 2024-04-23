const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const TodoListItems = require("./models/TodoListItems");
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const UserAcc = require('./models/DaftarUser');
const DaftarDokter = require("./models/DaftarDokter");
const passport = require('passport');
const initializePassport = require('./passport-config');
const path = require("path");
const DaftarPenyakit = require("./models/DaftarPenyakit");
const DaftarMakanan = require("./models/DaftarMakanan");

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`MongoDB connected at ${process.env.MONGO_URL}`);
  })
  .catch((err) => {
    console.log(err.message);
  });

// Fungsi untuk mendapatkan pengguna berdasarkan email
const getUserByEmail = async (email) => {
  try {
    const user = await UserAcc.findOne({ email: email });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

initializePassport(passport, getUserByEmail, id => UserAcc.findById(id));

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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

// EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render('index', { nama: req.user.name, title: "Home" });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});

app.get('/register', checkNotAuthenticated,(req, res) => {
  res.render('register');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
}), (req, res) => {
  // Jika pengguna berhasil login dan memiliki peran admin
  if (req.user.role === 'admin') {
    req.session.isAdmin = true; // Tambahkan properti isAdmin ke sesi
    return res.redirect('/admindashboard');
  }
  // Jika pengguna berhasil login tetapi bukan admin
  res.redirect('/');
});
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new UserAcc({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}

app.delete('/logout', (req, res, next) => {
  req.logOut(function(err) {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
});


function checkAdmin(req, res, next) {
  // Periksa apakah properti isAdmin telah diatur di sesi
  if (req.isAuthenticated() && req.session.isAdmin) {
    return next();
  }
  res.redirect('/');
}

app.get("/admindashboard", checkAuthenticated, checkAdmin, (req, res) => {
  res.render('admindash', { nama: req.user.name, title: "Dashboard" });
});

app.get("/food", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarMakanan.find();
    res.render("food.ejs", { todoListItems , nama: req.user.name, title: "Food"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
app.post("/food", upload.single("image"), async (req, res) => {
  try {
    const { title, description, role } = req.body; // Ambil nilai role dari formulir
    const newFood = new DaftarMakanan({
      title,
      description,
      role, // Masukkan nilai role ke objek DaftarMakanan
      image: req.file.filename,
    });
    await newFood.save();
    res.redirect("/food");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

app.get("/medicine", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await TodoListItems.find();
    res.render("medicine.ejs", { todoListItems , nama: req.user.name, title: "Medicine"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman medicine");
  }
});

app.post("/medicine", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newMedicine = new TodoListItems({
      title,
      description,
      image: req.file.filename,
    });
    await newMedicine.save();
    res.redirect("/medicine");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});

app.get("/information", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarPenyakit.find();
    res.render("information.ejs", { todoListItems ,  nama: req.user.name, title : "Information"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman penyakit");
  }
});

app.post("/information", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newSickness = new DaftarPenyakit({
      title,
      description,
      image: req.file.filename,
    });
    await newSickness.save();
    res.redirect("/information");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});

app.get("/doctors", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render("doctor.ejs", { todoListItems ,  nama: req.user.name, title : "Doctor"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman Dokter");
  }
});

app.post("/doctors", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newDoctors = new DaftarDokter({
      title,
      description,
      image: req.file.filename,
    });
    await newDoctors.save();
    res.redirect("/doctors");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menambahkan dokter");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
