const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./passport-config');
const path = require("path");
const DaftarPenyakit = require("./models/DaftarPenyakit");
const DaftarMakanan = require("./models/DaftarMakanan");
const DaftarUser = require("./models/DaftarUser");
const UserAcc = require('./models/DaftarUser');
const DaftarDokter = require("./models/DaftarDokter");
const TodoListItems = require("./models/TodoListItems");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
//connect mongodb
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`MongoDB connected at ${process.env.MONGO_URL}`);
  })
  .catch((err) => {
    console.log(err.message);
  });

//fungsi mencari user bedasarkan email
const getUserByEmail = async (email) => {
  try {
    const user = await UserAcc.findOne({ email: email });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//inisisalisasi passport
initializePassport(passport, getUserByEmail, id => UserAcc.findById(id));

const app = express();
const port = process.env.PORT || 5000;

//middleware
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

//konfig storage untuk file yang di upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", checkAuthenticated, (req, res) => {
  res.render('index', { nama: req.user.name, title: "Home" });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
}), async (req, res) => {
  if (req.user.role === 'admin') {
    req.session.isAdmin = true;
    req.user.lastLogin = Date.now();
    await req.user.save();
    return res.redirect('/admindashboard');
  }
  req.user.lastLogin = Date.now();
  await req.user.save();
  res.redirect('/');
});

app.post('/register', async (req, res) => {
  try {
    const existingUsername = await UserAcc.findOne({ name: req.body.name });
    if (existingUsername) {
      req.flash('error', 'Username already exists. Please choose a different username.');
      return res.redirect('/register');
    }
    const existingUser = await UserAcc.findOne({ email: req.body.email });
    if (existingUser) {
      req.flash('error', 'Email already registered. Please use a different email.');
      return res.redirect('/register');
    }
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

//fungsi middleware untuk mengecek apakah sudah terotentikasi
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

//fungsi middleware untuk mengecek apakah belum terotentikasi
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

//fungsi untuk mengecek apakah pengguna adalah admin 
function checkAdmin(req, res, next) {
  if (req.isAuthenticated() && req.session.isAdmin) {
    return next();
  }
  res.redirect('/');
}

// Route untuk menampilkan halaman dashboard admin
app.get("/admindashboard", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarUser.find();
    res.render('admindash', { todoListItems, nama: req.user.name, title: "Dashboard" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman dashboard");
  }
});
// Route untuk menghapus email user dari admin dashboard
app.delete("/delete-user/:email", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const email = req.params.email;
    const deletedUser = await UserAcc.findOneAndDelete({ email: email });
    if (!deletedUser) {
      return res.status(404).send("Akun pengguna tidak ditemukan");
    }
    res.status(200).send("Akun pengguna berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus akun pengguna");
  }
});

// Route untuk menampilkan halaman bmi kalkulator
app.get("/bmi", checkAuthenticated, (req, res) => {
  res.render('bmi', { nama: req.user.name, title: "BMI" });
});

// Route untuk menampilkan halaman crudFood di dashboard admin
app.get("/admindashboard/crudFood", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarMakanan.find();
    res.render('crudfood', { todoListItems, nama: req.user.name, title: "Crud Food" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
// Route untuk mengupdate makanan berdasarkan ID
app.post("/food/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, role } = req.body;
    const foodId = req.params.id;
    const updatedFood = await DaftarMakanan.findByIdAndUpdate(foodId, {
      title,
      description,
      role,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    if (!updatedFood) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/crudFood");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});
// Route untuk menghapus makanan berdasarkan ID
app.delete("/food/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedFood = await DaftarMakanan.findByIdAndDelete(req.params.id);
    if (!deletedFood) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.status(200).send("Makanan berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus makanan");
  }
});
// Route untuk menampilkan halaman makanan
app.get("/food", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarMakanan.find();
    res.render("food.ejs", { todoListItems, nama: req.user.name, title: "Food" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
// Route untuk menambahkan makanan baru
app.post("/food", upload.single("image"), async (req, res) => {
  try {
    const { title, description, role } = req.body;
    const newFood = new DaftarMakanan({
      title,
      description,
      role,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    await newFood.save();
    res.redirect("/food");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

// Route untuk menampilkan halaman crudMedicine di dashboard admin
app.get("/admindashboard/crudMedicine", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await TodoListItems.find();
    res.render('crudmedicine', { todoListItems, nama: req.user.name, title: "Crud Medicine" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman obat");
  }
});
// Route untuk menghapus obat berdasarkan ID
app.delete("/medicine/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedMedicine = await TodoListItems.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).send("obat tidak ditemukan");
    }
    res.status(200).send("obat berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus obat");
  }
});
// Route untuk mengupdate obat berdasarkan ID
app.post("/medicine/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, } = req.body;
    const medicineId = req.params.id;
    const updatedMedicine = await TodoListItems.findByIdAndUpdate(medicineId, {
      title,
      description,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    if (!updatedMedicine) {
      return res.status(404).send("Obat tidak ditemukan");
    }
    res.redirect("/admindashboard/crudMedicine");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});
// Route untuk menampilkan halaman obat
app.get("/medicine", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await TodoListItems.find();
    res.render("medicine.ejs", { todoListItems, nama: req.user.name, title: "Medicine" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman medicine");
  }
});
// Route untuk menambahkan obat baru
app.post("/medicine", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newMedicine = new TodoListItems({
      title,
      description,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    await newMedicine.save();
    res.redirect("/medicine");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});

// Route untuk menampilkan halaman crudSickness di dashboard admin
app.get("/admindashboard/crudSickness", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarPenyakit.find();
    res.render('crudsickness', { todoListItems, nama: req.user.name, title: "Crud Sickness" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman penyakit");
  }
});
// Route untuk mengupdate penyakit berdasarkan ID
app.post("/information/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, jenis } = req.body;
    const sicknessId = req.params.id;

    const updatedSickness = await DaftarPenyakit.findByIdAndUpdate(sicknessId, {
      title,
      description,
      jenis,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });

    if (!updatedSickness) {
      return res.status(404).send("Penyakit tidak ditemukan");
    }
    res.redirect("/admindashboard/crudSickness");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});
// Route untuk menghapus penyakit berdasarkan ID
app.delete("/information/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedSickness = await DaftarPenyakit.findByIdAndDelete(req.params.id);
    if (!deletedSickness) {
      return res.status(404).send("Penyakit tidak ditemukan");
    }
    res.status(200).send("Penyakit berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus penyakit");
  }
});
// Route untuk menampilkan halaman penyakit
app.get("/information", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarPenyakit.find();
    res.render("information.ejs", { todoListItems, nama: req.user.name, title: "Information" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman penyakit");
  }
});
// Route untuk menambahkan penyakit baru
app.post("/information", upload.single("image"), async (req, res) => {
  try {
    const { title, description, jenis } = req.body;
    const newSickness = new DaftarPenyakit({
      title,
      description,
      jenis,
      image: req.file.filename,
    });
    await newSickness.save();
    res.redirect("/information");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});

// Route untuk menampilkan halaman crudDoctor di dashboard admin
app.get("/admindashboard/crudDoctor", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render('cruddoctor', { todoListItems, nama: req.user.name, title: "Crud doctor" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman dokter");
  }
});
// Route untuk menghapus dokter berdasarkan ID
app.delete("/doctors/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedDoctor = await DaftarDokter.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).send("Dokter tidak ditemukan");
    }
    res.status(200).send("Dokter berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus dokter");
  }
});
// Route untuk mengupdate dokter berdasarkan ID
app.post("/doctors/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, rating, specialization } = req.body;
    const doctorId = req.params.id;
    const updatedDoctor = await DaftarDokter.findByIdAndUpdate(doctorId, {
      title,
      description,
      rating,
      specialization,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    if (!updatedDoctor) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/cruddoctor");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});
// Route untuk menampilkan halaman dokter
app.get("/doctors", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render("doctor.ejs", { todoListItems, nama: req.user.name, title: "Doctor" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman Dokter");
  }
});
// Route untuk menambahkan dokter baru
app.post("/doctors", upload.single("image"), async (req, res) => {
  try {
    const { title, description, rating, specialization } = req.body;
    const newDoctors = new DaftarDokter({
      title,
      description,
      rating,
      specialization,
      image: req.file ? `../uploads/${req.file.filename}` : null,
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


