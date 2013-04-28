
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , Facebook = require('facebook-node-sdk')
  , mongoose = require('mongoose')
  , audio = require('./routes/audio')
  , echoWrapper = require('./echonest')
  , gs = require('./grooveshark');

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

app.get('/', Facebook.loginRequired(scope), user.login, user.landing_page);
app.get('/login', Facebook.loginRequired(scope), user.login, user.landing_page);
app.get('/logout', user.logout);
app.get('/refresh', user.refresh);
app.get('/settings', Facebook.loginRequired(scope), user.login, user.settings);
app.get('/about', user.about);
app.post('/editArtist', user.editArtist)
app.post('/addFriend', user.addFriend);
app.post('/removeArtist', user.removeArtist)
app.post('/addArtist', user.addArtist);
app.post('/mixUpdate', user.mixUpdate);
app.post('/removeFriend', user.removeFriend);
app.get('/play',Facebook.loginRequired(scope), user.login, user.play);
app.get('/getNextSong', audio.getNextSong);
app.get('/locate', Facebook.loginRequired(scope), user.login, user.locate);
app.get('/newsearch', user.newsearch);
app.post('/autocomplete', audio.autocomplete);
app.post('/station', Facebook.loginRequired(scope), user.station);
app.post('/getLocation', user.getLocation);
app.get('/station/:station_id', Facebook.loginRequired(scope), user.station_view);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
