var isPlaying = false;
var playNewSong = function (song) {
  console.log("playing next");

  var re = /http:\/\/(.+\.grooveshark\.com)/gi;
  var serverName = re.exec(song.url)[1];
  console.log('obj',song)
  console.log('streamkey',song.StreamKey)
  console.log('servername',serverName)
  console.log('serverID',song.StreamServerID)
  window.player.setSongCompleteCallback("getNewSong");
  window.player.setErrorCallback("errorCallback");
  window.player.playStreamKey(song.StreamKey,serverName,song.StreamServerID);
  window.player.setVolume(99);
  isPlaying = true;
  $("#songName").text(song.songName + ' by ' + song.artistName);
  window.document.title = song.songName.toString();
  $("#songName").attr({'name': song.songName, 'artist': song.artistName});
  $("#album-art").html("");
  // $("#album-art").html("<img src='http://beta.grooveshark.com/static/albums/500_album.png" +
  //                       "' class='album-art'></img>");
  if (song.albumArt) {
    $("#album-art").append("<img src='http://beta.grooveshark.com/static/amazonart/l" +
                            song.albumArt + "' class='album-art'></img>")
  } else {
    $("#album-art").html("<img src='http://beta.grooveshark.com/static/albums/500_album.png" +
                         "' class='album-art'></img>");
  }
  $("#playpause").attr('src','/images/pause.png')

  //Reset voting buttons to the default -->
  $('.downvote').attr('src', '/images/down.png')
  $('.upvote').attr('src', '/images/up.png')
}

var pause_resume = function () {
  if(isPlaying) {
    window.player.pauseStream();
    isPlaying = false;
    $("#playpause").attr('src','/images/play.png')
  } else {
    window.player.resumeStream();
    isPlaying = true;
    $("#playpause").attr('src','/images/pause.png')
  }
}

var getNewSong = function () {
  $.get("/getNextSong",function(data){
    playNewSong(data);
    return false;
  });
}

var errorCallback = function (error) {
  console.log(error);
  getNewSong();
}

var vote_response = function(data) {
  console.log(data);
}

$(function () {
  getNewSong();
  $('#next').on('click',getNewSong);
  $('#playpause').on('click',pause_resume);
});
