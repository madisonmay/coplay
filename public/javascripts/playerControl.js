var songList;
var isPlaying = false;

var playNext = function () {
  console.log("playing next");
  if(songList.length > 0) {
    var song = songList.pop();
    var re = /http:\/\/(.+\.grooveshark\.com)/gi;
    var serverName = re.exec(song.url)[1];
    console.log(song.StreamKey)
    console.log(serverName)
    console.log(song.StreamServerID)
    window.player.setSongCompleteCallback("playNext");
    window.player.playStreamKey(song.StreamKey,serverName,song.StreamServerID);
    isPlaying = true;
    $("#songName").text("Track: "+song.songName);
    $("#artistName").text("Artist: "+song.artistName);
    $("#playpause").attr('src','images/pause.png')
  } else {
    isPlaying = false;
    $("#songName").text("[loading]");
    $("#artistName").text("[loading]");
    $("#playpause").attr('src','images/play.png')
    getNewPlaylist();
  }
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

var getNewPlaylist = function () {
  $.get("/getPlaylist",function(data){
    console.log(data);
    songList = data;
    console.log(songList);
    playNext();
    return false;
  });
}

$(function () {
  getNewPlaylist();
  $('#next').on('click',playNext);
  $('#playpause').on('click',pause_resume);
});