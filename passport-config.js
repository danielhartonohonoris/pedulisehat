const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UserAcc = require('./models/DaftarUser');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: 'Email tidak terdaftar' });
            }
            if (user.role === 'admin') {
                // Periksa apakah pengguna memiliki peran admin
                if (!password) {
                    // Jika tidak ada kata sandi yang dimasukkan, kembalikan pesan kesalahan
                    return done(null, false, { message: 'Silakan masukkan kata sandi' });
                } else {
                    // Jika ada kata sandi yang dimasukkan, periksa kecocokannya
                    if (await bcrypt.compare(password, user.password)) {
                        // Kata sandi benar, alihkan ke dashboard admin
                        return done(null, user);
                    } else {
                        // Kata sandi salah
                        return done(null, false, { message: 'Password Salah' });
                    }
                }
            } else {
                // Jika bukan admin, periksa kata sandi seperti biasa
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password Salah' });
                }
            }
        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;
