const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const TodoListItems = require("./models/TodoListItems");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

const passport = require('passport');

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

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
   
);

const users = [];

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET,
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

// EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/',checkAuthenticated, (req, res) => {
  res.render('index', { nama: req.user.name });
});

//login
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

//register
app.get('/register', checkNotAuthenticated,(req, res) => {
  res.render('register');
});

//post login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/index',
  failureRedirect: '/login',
  failureFlash: true
}))

//post register
app.post('/register', async (req, res) => {
 try   {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
  });
  res.redirect('/login');
 }    catch    {
  res.redirect('/register');
 }
 console.log(users);
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
  req.logOut(function
  (err) {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
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

//////HOME////////////
app.get("/index", (req, res) => {
  res.render("index.ejs",{title: "Home",});
});
//////////////////////


////////ABOUT////////////
app.get("/about", (req, res) => {
  res.render("about.ejs",{title: "About",});
});
//////////////////////////


///////MEDICINE//////////// 
app.get("/medicine", async (req, res) => {
  try {
    // Ambil data todoListItems dari basis data MongoDB
    const todoListItems = await TodoListItems.find(); // Sesuaikan dengan model dan nama koleksi Anda

    // Render halaman medicine.ejs dan lewati data todoListItems
    res.render("medicine.ejs", { todoListItems , title: "Medicine"});
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
      image: req.file.filename, // Menyimpan nama file gambar ke basis data
    });
    await newSickness.save();
    res.redirect("/medicine"); // Redirect kembali ke halaman medicine setelah menyimpan data
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});
//////////////////////////////////////


///////////INFORMATION//////////////
app.get("/information", async (req, res) => {
  try {
    // Ambil data todoListItems dari basis data MongoDB
    const todoListItems = await DaftarPenyakit.find(); // Sesuaikan dengan model dan nama koleksi Anda

    // Render halaman medicine.ejs dan lewati data todoListItems
    res.render("information.ejs", { todoListItems , title : "Information"});
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
      image: req.file.filename, // Menyimpan nama file gambar ke basis data
    });
    await newSickness.save();
    res.redirect("/information"); // Redirect kembali ke halaman medicine setelah menyimpan data
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menyimpan penyakit");
  }
});
////////////////////////////////////////


////////DOCTOR///////////////////////////
app.get("/doctors", async (req, res) => {
  try {
    // Ambil data todoListItems dari basis data MongoDB
    const todoListItems = await DaftarDokter.find(); // Sesuaikan dengan model dan nama koleksi Anda

    // Render halaman medicine.ejs dan lewati data todoListItems
    res.render("doctor.ejs", { todoListItems , title : "Doctor"});
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
      image: req.file.filename, // Menyimpan nama file gambar ke basis data
    });
    await newDoctors.save();
    res.redirect("/doctors"); // Redirect kembali ke halaman medicine setelah menyimpan data
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat menambahkan dokter");
  }
});
////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const path = require("path");
const DaftarPenyakit = require("./models/DaftarPenyakit");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const DaftarDokter = require("./models/DaftarDokter");
const { title } = require("process");

