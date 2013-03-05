var songList;
var isPlaying = false;

var playNext = function () {
  if(songList.length > 0) {
    var song = songList.pop();
    var re = /http:\/\/.+\.grooveshark\.com/gi;
    var serverName = re.exec(song.url)[0];
    window.player.playStreamKey(song.StreamKey,serverName,song.StreamServerID);
    window.player.setSongCompleteCallback(playNext);
    isPlaying = true;
    $("#songName").val(song.songName);
    $("#artistName").val(song.artistName);
  } else {
    isPlaying = false;
  }
}

var pause_resume = function () {
  if(isplaying) {
    window.player.pauseStream();
    isPlaying = false;
  } else {
    window.player.resumeStream();
    isPlaying = true;
  }
}

$(function () {
  $.get("/getPlaylist", {mixID:???},function(data){
    songList = data.playlist;
    playNext();
    return false;
  });
});