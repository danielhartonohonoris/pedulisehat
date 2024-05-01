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
const DaftarUser = require("./models/DaftarUser");

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
}), async (req, res) => {
  // Jika pengguna berhasil login dan memiliki peran admin
  if (req.user.role === 'admin') {
    req.session.isAdmin = true; // Tambahkan properti isAdmin ke sesi
    // Update waktu terakhir login
    req.user.lastLogin = Date.now();
    await req.user.save();
    return res.redirect('/admindashboard');
  }
  // Jika pengguna berhasil login tetapi bukan admin
  // Update waktu terakhir login
  req.user.lastLogin = Date.now();
  await req.user.save();
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

function checkAdmin(req, res, next) {
  // Periksa apakah properti isAdmin telah diatur di sesi
  if (req.isAuthenticated() && req.session.isAdmin) {
    return next();
  }
  res.redirect('/');
}

app.get("/admindashboard", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarUser.find();
    res.render('admindash', { todoListItems , nama: req.user.name, title: "Dashboard" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman dashboard");
  }
});

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



app.get("/bmi", checkAuthenticated,  (req, res) => {
  res.render('bmi', { nama: req.user.name, title: "BMI" });
});


app.get("/admindashboard/crudFood", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarMakanan.find();
    res.render('crudfood', { todoListItems , nama: req.user.name, title: "Crud Food"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
app.post("/admindashboard/crudFood", upload.single("image"), async (req, res) => {
  try {
    const { title, description, role } = req.body; // Ambil nilai role dari formulir
    const newFood = new DaftarMakanan({
      title,
      description,
      role, // Masukkan nilai role ke objek DaftarMakanan
      image:  req.file ? `../uploads/${req.file.filename}` : null
    });
    await newFood.save();
    res.redirect("/food");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});


app.post("/food/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, role } = req.body;
    const foodId = req.params.id;

    // Temukan makanan berdasarkan ID dan perbarui datanya
    const updatedFood = await DaftarMakanan.findByIdAndUpdate(foodId, {
      title,
      description,
      role,
      // Gunakan req.file.filename jika ada, atau gunakan nilai yang ada jika tidak
      image: req.file ? `../uploads/${req.file.filename}` : null
    });

    // Periksa apakah makanan ditemukan
    if (!updatedFood) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/crudFood");
  } catch (error) {
    // Tangani kesalahan
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});

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
      image:  req.file ? `../uploads/${req.file.filename}` : null
    });
    await newFood.save();
    res.redirect("/food");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// crud medicine///////////////////////////////////////////////////////

app.get("/admindashboard/crudMedicine", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await TodoListItems.find();
    res.render('crudmedicine', { todoListItems , nama: req.user.name, title: "Crud Medicine"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
app.post("/admindashboard/crudMedicine", upload.single("image"), async (req, res) => {
  try {
    const { title, description,} = req.body; // Ambil nilai role dari formulir
    const newMedicine = new TodoListItems({
      title,
      description,
      // Masukkan nilai role ke objek DaftarMakanan
      image:  req.file ? `../uploads/${req.file.filename}` : null
    });
    await newMedicine.save();
    res.redirect("/medicine");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

app.delete("/medicine/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedMedicine = await TodoListItems.findByIdAndDelete(req.params.id);
    if (!deletedMedicine) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.status(200).send("Makanan berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus makanan");
  }
});

app.post("/medicine/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, } = req.body;
    const medicineId = req.params.id;

    // Temukan makanan berdasarkan ID dan perbarui datanya
    const updatedMedicine = await TodoListItems.findByIdAndUpdate(medicineId, {
      title,
      description,
    
      // Gunakan req.file.filename jika ada, atau gunakan nilai yang ada jika tidak
      image: req.file ? `../uploads/${req.file.filename}` : null
    });

    // Periksa apakah makanan ditemukan
    if (!updatedMedicine) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/crudMedicine");
  } catch (error) {
    // Tangani kesalahan
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
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
/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// crud sickness //////////////////////////////////////////////////////////

// Route untuk halaman CRUD Penyakit
app.get("/admindashboard/crudSickness", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarPenyakit.find();
    res.render('crudsickness', { todoListItems , nama: req.user.name, title: "Crud Sickness"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman penyakit");
  }
});

// Route untuk menambahkan penyakit baru
app.post("/admindashboard/crudSickness", upload.single("image"), async (req, res) => {
  try {
    const { title, description, jenis } = req.body;
    const newSickness = new DaftarPenyakit({
      title,
      description,
      jenis,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });
    await newSickness.save();
    res.redirect("/information");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});

// Route untuk mengedit penyakit
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

// Route untuk menghapus penyakit
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


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// crud doctor///////////////////////////////////////////////////////

app.get("/admindashboard/crudDoctor", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render('cruddoctor', { todoListItems , nama: req.user.name, title: "Crud doctor"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
app.post("/admindashboard/crudDoctor", upload.single("image"), async (req, res) => {
  try {
    const { title, description, rating, specialization} = req.body; // Ambil nilai role dari formulir
    const newdoctor = new DaftarDokter({
      title,
      description,
      rating,
      specialization,
      image:  req.file ? `../uploads/${req.file.filename}` : null
    });
    await newdoctor.save();
    res.redirect("/doctor");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

app.delete("/doctors/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedDoctor = await DaftarDokter.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.status(200).send("Makanan berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus makanan");
  }
});

app.post("/doctors/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, rating, specialization} = req.body;
    const doctorId = req.params.id;

    // Temukan makanan berdasarkan ID dan perbarui datanya
    const updatedDoctor = await DaftarDokter.findByIdAndUpdate(doctorId, {
      title,
      description,
      rating,
      specialization,
      image: req.file ? `../uploads/${req.file.filename}` : null
    });

    // Periksa apakah makanan ditemukan
    if (!updatedDoctor) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/cruddoctor");
  } catch (error) {
    // Tangani kesalahan
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
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

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// crud doctor///////////////////////////////////////////////////////

app.get("/admindashboard/cruddoctor", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render('cruddoctor', { todoListItems , nama: req.user.name, title: "Crud doctor"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman makanan");
  }
});
app.post("/admindashboard/cruddoctor", upload.single("image"), async (req, res) => {
  try {
    const { title, description,} = req.body; // Ambil nilai role dari formulir
    const newdoctor = new DaftarDokter({
      title,
      description,
      // Masukkan nilai role ke objek DaftarMakanan
      image:  req.file ? `../uploads/${req.file.filename}` : null
    });
    await newdoctor.save();
    res.redirect("/doctor");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan makanan");
  }
});

app.delete("/doctors/:id", checkAuthenticated, checkAdmin, async (req, res) => {
  try {
    const deletedDoctor = await DaftarDokter.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.status(200).send("Makanan berhasil dihapus");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menghapus makanan");
  }
});

app.post("/doctors/:id", checkAuthenticated, checkAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, } = req.body;
    const doctorId = req.params.id;

    // Temukan makanan berdasarkan ID dan perbarui datanya
    const updatedDoctor = await DaftarDokter.findByIdAndUpdate(medicineId, {
      title,
      description,
    
      // Gunakan req.file.filename jika ada, atau gunakan nilai yang ada jika tidak
      image: req.file ? `../uploads/${req.file.filename}` : null
    });

    // Periksa apakah makanan ditemukan
    if (!updatedMedicine) {
      return res.status(404).send("Makanan tidak ditemukan");
    }
    res.redirect("/admindashboard/cruddoctor");
  } catch (error) {
    // Tangani kesalahan
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan perubahan");
  }
});


app.get("/doctor", checkAuthenticated, async (req, res) => {
  try {
    const todoListItems = await DaftarDokter.find();
    res.render("doctor.ejs", { todoListItems , nama: req.user.name, title: "doctor"});
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman doctor");
  }
});

app.post("/doctor", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newdoctor = new DaftarDokter({
      title,
      description,
      image: req.file.filename,
    });
    await newdoctor.save();
    res.redirect("/doctor");
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


