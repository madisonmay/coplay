
exports.about = function(req, res){
    res.render("index", {title: 'CoPlay', logged_in: false});
};

exports.home = function(req, res){
    res.render("home", {title: 'CoPlay'});
};
