const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User')
const User = mongoose.model("Users");
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get("/registro", (req, res) => {
    res.render("users/register");
});

router.post("/registro", (req, res) => {
    var errors = validateInput(req);

    if (errors.length > 0) {        
        res.render("users/register", {errors: errors});
    } else {
        User.findOne({Email: req.body.email}).lean().then((user) => {
            if (user) {
                req.flash("error_msg", "E-mail já cadastrado no sistema.")
                res.redirect("/usuarios/registro");
            } else {

                const newUser = new User({
                    Name: req.body.nome,
                    Email: req.body.email,
                    Password: req.body.senha
                });

                //codifica a senha
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.Password, salt, (error, hash) => {
                        if (error) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.");
                            res.redirect("/");
                        } else {
                            newUser.Password = hash;
                            newUser.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso.")
                                res.redirect("/");
                            }).catch((error) => {
                                req.flash("error_msg", "Houve um erro ao criar o usuário.")
                                res.redirect("/usuarios/registro");
                            });
                        }
                    });
                });
            }            
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/");
        });
    }
});

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/logout", (req, res, next) => {
    req.logout();
    req.flash("success_msg", "Desconectado com sucesso!")
    res.redirect("/");
});

function validateInput(req) {

    var errors = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ text: "Nome inválido." });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ text: "E-mail inválido." });
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ text: "Senha inválida." });
    }

    if (req.body.senha.length < 4) {
        errors.push({ text: "Senha muito fraca." });
    }

    if (req.body.senha !=  req.body.senha2) {
        errors.push({ text: "As senhas não coincidem." });
    }

    return errors;
}

module.exports = router;