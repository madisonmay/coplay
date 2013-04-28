swfobject.embedSWF("http://grooveshark.com/APIPlayer.swf", "player", "300", "300", "9.0.0", "", {}, {allowScriptAccess: "always"}, {id:"groovesharkPlayer", name:"groovesharkPlayer"}, function(e) {
  var element = e.ref;
  
  if (element) {
    setTimeout(function() {
        console.log('test')
        window.player = element;
        window.player.setVolume(99);
    }, 1500);
  }
});