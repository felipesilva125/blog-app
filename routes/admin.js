const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category')
const Category = mongoose.model("Categories");
require('../models/Post')
const Post = mongoose.model("Posts");

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
        req.flash("error_msg", "Erro ao listar as categorias.");
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
    
    var errors = validateInputCategories(req);

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
    
    var errors = validateInputCategories(req);

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
            req.flash("error_msg", "Erro ao criar categoria.");            
            res.redirect("/admin/categorias");
        });        
    }    
});

router.get('/categorias/deletar/:id', (req, res) => {    
    Category.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Categoria removida com sucesso.");
        res.redirect("/admin/categorias");
    }).catch(() => {
        req.flash("error_msg", "Falha ao remover categoria.");
        res.redirect("/admin/categorias");
    });
});

router.get('/postagens', (req, res) => {
    Post.find().populate("Category").lean().sort({Date: 'desc'}).then((posts) => {
        res.render("admin/posts", {posts: posts});
    })
    .catch((error) => {
        req.flash("error_msg", "Erro ao listar as postagens.");
    });
});

router.get('/postagens/add', (req, res) => {
    Category.find().lean().then((categories) => {
        res.render("admin/addPost", {categories: categories});
    }).catch((error) => {
        req.flash("error_msg", "Erro ao listar as categorias.");
        res.redirect("/admin/postagens");
    });
});

router.post('/postagens/nova', (req, res) => {
    
    var errors = validateInputPosts(req);

    if (errors.length > 0) {
        res.render("admin/addPost", {errors: errors});
    }
    else {
        const newPost = {
            Title: req.body.titulo,
            Slug: req.body.slug,
            Content: req.body.conteudo,
            Description: req.body.descricao,
            Category: req.body.categoria
        };

        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso.");
            res.redirect("/admin/postagens");
        }).catch((error) => {            
            req.flash("error_msg", "Erro ao criar postagem.");     
            res.redirect("/admin/postagens");
        });
    }
});

router.get('/postagens/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {
        Category.find().lean().then((categories) => {
            res.render("admin/editPost", {post: post, categories: categories});
        }).catch((error) => {
            req.flash("error_msg", "Post inexistente.");
            res.redirect("/admin/postagens");
        });        
    }).catch((error) => {
        req.flash("error_msg", "Post inexistente.");
        res.redirect("/admin/postagens");
    });    
});

router.post('/postagens/edit', (req, res) => {
    
    var errors = validateInputPosts(req);

    if (errors.length > 0) {
        res.render("admin/addPost", {errors: errors});
    }
    else {        
        Post.findOne({_id: req.body.id}).then((post) => {            
            post.Title = req.body.titulo;
            post.Slug = req.body.slug;
            post.Content = req.body.conteudo;
            post.Description = req.body.descricao;
            post.Category = req.body.categoria;

            post.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso.");
                res.redirect("/admin/postagens");
            }).catch((error) => {
                req.flash("error_msg", "Houve um erro ao salvar a edição.");
                res.redirect("/admin/postagens");
            });
        })
        .catch((error) => {            
            req.flash("error_msg", "Houve um erro ao editar a postagem.");
            res.redirect("/admin/postagens");
        });
    }
});

router.get('/postagens/deletar/:id', (req, res) => {    
    Post.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem removida com sucesso.");
        res.redirect("/admin/postagens");
    }).catch(() => {
        req.flash("error_msg", "Falha ao remover postagem.");
        res.redirect("/admin/postagens");
    });
});

function validateInputPosts(req) {

    var errors = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        errors.push({ text: "Título inválido." });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ text: "Slug inválido." });
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        errors.push({ text: "Descrição inválida." });
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        errors.push({ text: "Conteúdo inválido." });
    }

    if (req.body.categoria == "0") {
        errors.push({ text: "Categoria inválida." });
    }

    return errors;
}

function validateInputCategories(req) {

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