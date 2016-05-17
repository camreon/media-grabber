var mediaStorage = [];

var isMedia = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      contentType: ['audio/mpeg', 'video/webm'] }),
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message: 'media found'})
  ]
};

chrome.declarativeWebRequest.onRequest.removeRules(undefined, function() {
  chrome.declarativeWebRequest.onRequest.addRules([isMedia]);
});


chrome.declarativeWebRequest.onMessage.addListener(function(media) {
  chrome.tabs.get(media.tabId, function(tab) { 
    mediaStorage[media.tabId] = { tab: tab.url, url: media.url };
  });

  chrome.pageAction.show(media.tabId);
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.event === 'getMedia') {
      chrome.storage.sync.get(['usePlaylist', 'playlistURL'], function(item) {
        var media = mediaStorage[request.tabId];

        if (item.usePlaylist) { sendToPlaylist(media, item.playlistURL); }

        sendResponse({  
          sent: item.usePlaylist,
          tab: media.tab,
          media: media.url,
          playlist: item.playlistURL
        });
      });
      
      return true;
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
  xhr.addEventListener("error", function(e) {
    sent = false;
    console.error(e);
//     media.tabURL = media.url; // try to send the media url next
//     sendToPlaylist(media);
  });

  xhr.open(method, playlistURL);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send('url=' + encodeURIComponent(media.tab));

  return sent;
}