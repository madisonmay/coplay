var isPlaying = false;
var streamkey;
var serverID;
var songID;
var playNewSong = function (song) {
  console.log("playing next");

  var re = /http:\/\/(.+\.grooveshark\.com)/gi;
  var serverName = re.exec(song.url)[1];
  console.log('obj',song);
  console.log('streamkey',song.StreamKey);
  console.log('servername',serverName);
  console.log('serverID',song.StreamServerID);
  streamkey = song.StreamKey;
  serverID = song.StreamServerID;
  songID = song.SongID;
  window.player.setSongCompleteCallback("songComplete");
  window.player.setErrorCallback("errorCallback");
  window.player.playStreamKey(song.StreamKey,serverName,song.StreamServerID);
  window.player.setVolume(99);
  isPlaying = true;
  $("#songName").html(song.songName);
  $("#artistName").html(song.artistName);
  window.document.title = song.songName.toString();
  $("#songName").attr({'name': song.songName, 'artist': song.artistName});
  $("#album-art").html("");
  // $("#album-art").html("<img src='http://beta.grooveshark.com/static/albums/500_album.png" +
  //                       "' class='album-art'></img>");
  if (song.albumArt) {
    $("#album-art").append("<img src='http://beta.grooveshark.com/static/amazonart/l" +
                            song.albumArt + "' class='album-art'></img>");
  } else {
    $("#album-art").html("<img src='http://beta.grooveshark.com/static/albums/500_album.png" +
                         "' class='album-art'></img>");
  }
  $("#playpause").attr('src','/images/pause.png');

  //Reset voting buttons to the default -->
  $('.downvote').attr('src', '/images/down.png');
  $('.upvote').attr('src', '/images/up.png');
  setTimeout(played30sec,30000);
};

var pause_resume = function () {
  if(isPlaying) {
    window.player.pauseStream();
    isPlaying = false;
    $("#playpause").attr('src','/images/play.png');
  } else {
    window.player.resumeStream();
    isPlaying = true;
    $("#playpause").attr('src','/images/pause.png');
  }
};

var played30sec = function() {
  $.post("/markPlayed30sec",{streamkey:streamkey,serverID:serverID})
}

var songComplete = function() {
  $.post("/markSongComplete",{streamkey:streamkey,serverID:serverID,songID:songID})
  getNewSong();
}

var getNewSong = function () {
  $.get("/getNextSong",function(data){
    playNewSong(data);
    return false;
  });
};

var errorCallback = function (error) {
  console.log(error);
  getNewSong();
};

var vote_response = function(data) {
  console.log(data);
};

$(function () {
  getNewSong();
  $('#next').on('click',getNewSong);
  $('#playpause').on('click',pause_resume);
});
