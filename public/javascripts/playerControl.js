var isPlaying = false;
var playNewSong = function (song) {
  console.log("playing next");

  var re = /http:\/\/(.+\.grooveshark\.com)/gi;
  var serverName = re.exec(song.url)[1];
  console.log(song.StreamKey)
  console.log(serverName)
  console.log(song.StreamServerID)
  window.player.setSongCompleteCallback("getNewSong");
  window.player.playStreamKey(song.StreamKey,serverName,song.StreamServerID);
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
  $.get("/getPlaylist",function(data){
    console.log(data);
    playNewSong(data);
    return false;
  });
}

$(function () {
  getNewSong();
  $('#next').on('click',getNewSong());
  $('#playpause').on('click',pause_resume);
});