const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const UserAcc = require('./models/DaftarUser');

function initialize(passport,getUserByEmail,getUserById){

    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'},authenticateUser));
    passport.serializeUser((user,done)=>done(null,user.id));
    passport.deserializeUser((id,done)=>{
        return done(null,getUserById(id));
    });
}

module.exports = initialize;
