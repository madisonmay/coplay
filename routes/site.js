exports.home = function(req, res){
    res.render("home", {title: 'CoPlay'});
};

exports.about = function(req, res){
    res.render("about", {title: 'CoPlay', logged_in: false});
};

