const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin')
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const { response } = require('express');
require('./models/Post')
const Post = mongoose.model("Posts");
require('./models/Category')
const Category = mongoose.model("Categories");

//Config

//Session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg"); //cria variável global
    res.locals.error_msg = req.flash("error_msg"); //cria variável global
    next();
});

//Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//HandleBars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp", {
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to database.");
}).catch((error) => {
    console.log(`Error: ${error}`);
});

//Public
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.get('/', (req, res) => {
    Post.find().populate("Category").lean().sort({Date: "desc"}).then((posts) => {
        res.render("index", {posts: posts});
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar as postagens.");
        res.redirect("/error");
    });    
});

app.get('/error', (req, res) => {
    res.send("Erro 404!");
});

app.get('/postagem/:slug', (req, res) => {
    console.log(req.params.slug);
    Post.findOne({Slug: req.params.slug}).lean().then((post) => {
        console.log(post);
        if (post) {
            res.render("post/index", {post: post});
        } else {
            req.flash("error_msg", "Esta postagem não existe.");
            res.redirect("/");
        }        
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno.");
        res.redirect("/");
    });   
});

app.get('/categorias', (req, res) => {
    Category.find().lean().then((categories) => {
        res.render("categories/index", {categories: categories});
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias.");
        res.redirect("/");
    });
});

app.get('/categorias/:slug', (req, res) => {
    Category.findOne({Slug: req.params.slug}).lean().then((category) => {
        if (category) {
            Post.find({Category: category._id}).lean().then((posts) => {
                console.log(posts);
                res.render("categories/posts", {category: category, posts: posts});
            }).catch((error) => {
                req.flash("error_msg", "Erro ao encontrar as postagens.");
                res.redirect("/");
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe.");
            res.redirect("/");
        }        
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.");
        res.redirect("/");
    });
});

app.use('/admin', admin);

const port = 8081;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

