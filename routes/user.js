exports.landing_page = function(req, res){
    res.render("login", {title: 'CoPlay'});
};

exports.login = function(req, res){
    res.send("Placeholder for login handler");
};

exports.logout = function(req, res){
    res.send('Placeholder for logout handler');
};

exports.settings = function(req, res){
    res.send('Placeholder for settings page');
};




