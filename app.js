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
app.use('/admin', admin);

const port = 8081;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

