
/**
 * Module dependencies.
 */

var express = require('express')
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
var Station = models.Station;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(express.session());
  app.use(express.methodOverride());
  app.use(Facebook.middleware({appId: process.env.FB_APPID, secret: process.env.FB_SECRET}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(app.router);

app.use(function(req, res, next){
  res.render('404', { status: 404, url: req.url, title: 'Something went wrong' });
});


app.use(function(err, req, res, next){
  res.render('500', { status: err.status || 500, error: err, title: 'Something went wrong'});
});

server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

var scope = {scope: ['']};

app.get('/', user.landing_page);
app.get('/login', Facebook.loginRequired(scope), user.login, user.landing_page);
app.get('/logout', user.logout);
app.get('/refresh', user.refresh);
app.get('/settings', Facebook.loginRequired(scope), user.login, user.settings);
app.get('/about', user.about);
app.get('/play', Facebook.loginRequired(scope), user.login, user.play);
app.get('/locate', Facebook.loginRequired(scope), user.login, user.locate);
app.get('/newsearch', Facebook.loginRequired(scope), user.login, user.newsearch);
app.get('/getNextSong', function(req,res) {audio.getNextSong(req,res,io)});
app.get('/getPlaylist', audio.generateNewPlaylist);
// app.get('/station/:station_id', Facebook.loginRequired(scope), user.login, function(req,res){
//   user.station_view(req, res, io);
// });
app.post('/editArtist', user.editArtist);
app.post('/addFriend', user.addFriend);
app.post('/removeArtist', user.removeArtist);
app.post('/addArtist', user.addArtist);
app.post('/mixUpdate', user.mixUpdate);
app.post('/removeFriend', user.removeFriend);
app.post('/autocomplete', audio.autocomplete);
app.post('/station', user.station);
app.post('/getLocation', user.getLocation);
app.post('/transferHost', function(req,res) {user.transferHost(req,res,io)});
app.post('/markPlayed30sec', audio.markPlayed30sec);
app.post('/markSongComplete', audio.markSongComplete);
app.get('/station/:station_id', Facebook.loginRequired(scope), user.login, function(req,res) {user.station_view(req,res,io)});
app.post('/station/:station_id/addArtist', function(req,res) {user.addNewArtist(req,res,io)});
app.post('/station/:station_id/addTrack', function(req,res) {user.addNewTrack(req,res,io)});
app.post('/station/:station_id/delete', user.deleteStation);
app.post('/station/:station_id/edit', function(req,res) {user.editSongWeight(req,res,io)});
app.get('/friends', Facebook.loginRequired(scope), user.login, user.friends);
app.get('/friend/:friend_id', Facebook.loginRequired(scope), user.login, user.friend_page);
app.get('/search/stations', user.search_stations);
app.post('/search/stations', user.station_search);

// io.configure(function () {
//   io.set("transports", ["xhr-polling"]);
//   io.set("polling duration", 10);
// });

io.set('log level', 1); // reduce logging

io.sockets.on('connection', function (socket) {
  // put the socket into the station's room
  socket.on('addToStation', function (stationID) {
    socket.set('stationID',stationID);
    socket.join(stationID);
  });
  socket.on('setHost', function (host) {
    socket.set('host',host);
  });
  socket.on('disconnect', function (){
    socket.get('stationID',function (err,id){
      socket.get('host',function (err,host) {
        socket.leave(id);
        if (host) {
          io.sockets.in(id).emit('redirect',{url:'/locate'});
        }
      });
    });
  });
});


