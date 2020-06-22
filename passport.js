const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');

const userModel = require('./models/userModel');

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
    },
    function (username, password, cb) {
        return userModel.getByUsername(username)
            .then((data) => {  
                console.log(JSON.stringify(data))
                if (data.length > 0) {
                    console.log("RAW: " + data[0].password)
                    bcrypt.compare(password, data[0].password, (err, res) => {
                        // console.log("Is decrypted" + res)
                        if (res) {
                            return cb(null, { loginUser: data[0] }, { message: 'Logged in successfully', code: 3 });
                        }
                        else {
                            cb(null, false, { message: 'Wrong password', code: 1 });
                        }
                    })
                }
                else {
                    return cb(null, false, { message: 'Wrong email', code: 0 });
                }
            })
            .catch((error) => {
                return cb(error)
            });
    }
));



passport.use(new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'S_Team',
    },
    function (jwtPayload, cb) {
        // console.log("PAYLOAD: " + JSON.stringify(jwtPayload));
        // console.log(jwtPayload);
        return userModel.getById(jwtPayload.id)
            .then(user => {
                if (user.length > 0)
                    return cb(null, user[0], { message: 'Authorized', code: 1 });
                else
                    return cb(null, null, { message: 'Cannot get User', code: 0 })
            })
            .catch(err => {
                return cb(err, null, { message: 'Can not authorized', code: 0 });
            });
    },
));

