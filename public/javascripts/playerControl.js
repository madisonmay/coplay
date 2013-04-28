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
  $("#songName").text("Track: "+song.songName);
  $("#artistName").text("Artist: "+song.artistName);
  $("#playpause").attr('src','images/pause.png')
}

var pause_resume = function () {
  if(isPlaying) {
    window.player.pauseStream();
    isPlaying = false;
    $("#playpause").attr('src','images/play.png')
  } else {
    window.player.resumeStream();
    isPlaying = true;
    $("#playpause").attr('src','images/pause.png')
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

$(function () {
  getNewSong();
  $('#next').on('click',getNewSong);
  $('#playpause').on('click',pause_resume);
});