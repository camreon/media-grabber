var the_media;

var isMedia = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      contentType: ['audio/mpeg', 'video/webm'] }),
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message: 'send media'})
  ]
};


chrome.declarativeWebRequest.onRequest.removeRules(undefined, function() {
  chrome.declarativeWebRequest.onRequest.addRules([isMedia]);
});

chrome.declarativeWebRequest.onMessage.addListener(function(media) {
  chrome.tabs.get(media.tabId, function(tab) { 
    media.tabURL = tab.url; 
  });

  chrome.pageAction.show(media.tabId);
  the_media = media;
});

chrome.runtime.onMessage.addListener(function(msg, sender, response) {
  var sent = false;
  if (msg === 'pageActionClicked') {
    // console.info(the_media);
    
    var playlistURL = chrome.storage.sync.get({
      playlistURL: "" 
    }, function(items) {
      sent = sendToPlaylist(the_media, items.playlistURL);
      response({ sent: sent });
    });
  }
});

function sendToPlaylist(media, playlistURL) {
  var xhr = new XMLHttpRequest(),
      method = 'POST',
      sent = false;
  
  xhr.addEventListener("load", function(e) {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.staus == 302)
      sent = true;
  });

//   xhr.addEventListener("error", function(e) {
//     media.tabURL = media.url; // try to send the media url next
//     sendToPlaylist(media);
//   });

  xhr.open(method, playlistURL);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send('url=' + encodeURIComponent(media.tabURL));
  return sent;
}