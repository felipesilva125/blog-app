module.exports = {
    isAdmin: function(req, res, next) {        
        if (req.isAuthenticated() && req.user.Admin == 1) {
            return next();
        } else {
            req.flash("error_msg", "Necessário permissão de administrador para acessar.");
            res.redirect("/");
        }
    }
}