
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , site = require('./routes/site')
  , http = require('http')
  , path = require('path')
  , Facebook = require('facebook-node-sdk')
  , mongoose = require('mongoose')
  , gs = require('./grooveshark')
  , audio = require('./routes/audio')
  , echoWrapper = require('./echonest');

var app = express();
mongoose.connect((process.env.MONGOLAB_URI||'mongodb://localhost/coplay'));
var models = require('./models/models');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(express.session());
  app.use(Facebook.middleware({appId: process.env.FB_APPID, secret: process.env.FB_SECRET}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var scope = {scope: ['']};

app.get('/', user.landing_page);
app.get('/login', Facebook.loginRequired(scope), user.login);
app.get('/logout', user.logout);
app.get('/refresh', user.refresh);
app.get('/settings', user.settings);
app.get('/about', site.about);
app.get('/home', site.home);
app.post('/editArtist', user.editArtist)
app.post('/addFriend', user.addFriend);
app.post('/removeArtist', user.removeArtist)
app.post('/addArtist', user.addArtist);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
