const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/User')
const User = mongoose.model("Users");

module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: "email", passwordField: "senha"}, (email, password, done) => {

        User.findOne({Email: email}).lean().then((user) => {
            if (!user) {
                return done(null, false, {message: "Conta inexistente."})
            }

            bcrypt.compare(password, user.Password, (error, equal) => {

                if (equal) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Senha incorreta."})
                }
            });
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/usuario/login");
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user);
        }).lean();        
    });
}