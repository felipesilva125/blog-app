const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category')
const Category = mongoose.model("Categories");

router.get('/', (req, res) => {
    res.render("admin/index");
});

router.get('/posts', (req, res) => {
    res.send("Página de posts");
});

router.get('/categorias', (req, res) => {
    Category.find().lean().sort({Date: 'desc'}).then((categories) => {
        res.render("admin/categories", {categories: categories});
    })
    .catch((error) => {
        req.flash("error_msg", `Erro ao listar as categorias: ${error}`);
    });
});

router.get('/categorias/add', (req, res) => {
    res.render("admin/addCategories");
});

router.get('/categorias/edit/:id', (req, res) => {
    Category.findOne({_id: req.params.id}).lean().then((category) => {
        res.render("admin/editCategories", {category: category});
    }).catch((error) => {
        req.flash("error_msg", "Categoria inexistente.");
        res.redirect("/admin/categorias");
    });    
});

router.post('/categorias/edit', (req, res) => {
    
    var errors = validateInput(req);

    if (errors.length > 0) {
        res.render("admin/addCategories", {errors: errors});
    }
    else {        
        Category.findOne({_id: req.body.id}).then((category) => {
            category.Name = req.body.nome;
            category.Slug = req.body.slug;

            category.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso.");
                res.redirect("/admin/categorias");
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao salvar a edição.");
                res.redirect("/admin/categorias");
            });
        })
        .catch((error) => {            
            req.flash("error_msg", "Houve um erro ao editar a categoria.");
            res.redirect("/admin/categorias");
        });
    }
});

router.post('/categorias/nova', (req, res) => {
    
    var errors = validateInput(req);

    if (errors.length > 0) {
        res.render("admin/addCategories", {errors: errors});
    }
    else {
        const newCategory = {
            Name: req.body.nome,
            Slug: req.body.slug
        }
    
        new Category(newCategory).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso.");
            res.redirect("/admin/categorias");
        }).catch((error) => {
            res.redirect("/admin");
            req.flash("error_msg", "Erro ao criar categoria.");            
        });        
    }    
});

router.post('/categorias/deletar', (req, res) => {    
    Category.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria removida com sucesso.");
        res.redirect("/admin/categorias");
    }).catch(() => {
        req.flash("error_msg", "Falha ao remover categoria.");
        res.redirect("/admin/categorias");
    });
});

function validateInput(req) {
    var errors = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ text: "Nome inválido." });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ text: "Slug inválido." });
    }

    if (req.body.nome.length < 2) {
        errors.push({ text: "Nome da categoria muito pequeno." });
    }
    return errors;
}

module.exports = router;