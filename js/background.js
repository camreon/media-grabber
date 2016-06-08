var mediaStorage = [];
var isMedia = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      contentType: [ 'audio/mpeg', 'video/webm', 'video/mp4' ]
    }),
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message: 'foundMedia'})
  ]
};

chrome.declarativeWebRequest.onRequest.removeRules(undefined, function() {
  chrome.declarativeWebRequest.onRequest.addRules([isMedia]);
});

chrome.declarativeWebRequest.onMessage.addListener(function(media) {
  if (media.message === 'foundMedia') {
    chrome.tabs.get(media.tabId, function(tab) {
      mediaStorage[media.tabId] = { tab: tab.url, url: media.url };
    });
    chrome.pageAction.show(media.tabId);
  }
});

chrome.runtime.onMessage.addListener(
  function(req, sender, sendRes) {
    if (req.event !== 'getMedia')
      return;
    chrome.storage.sync.get(null, function(opt) {
      var media = mediaStorage[req.tabId];
      var src = (opt.source == 'MEDIA URL') ? media.url : media.tab;

      if (opt.output)
        sendToPlaylist(src, opt.dest);

      sendRes({ tab: media.tab, media: media.url, opt: opt });
    });
    return true;
});

chrome.runtime.onMessage.addListener(
  function(req, sender, sendRes) {
    if (req.event !== 'sendToPlaylist')
      return;
    chrome.storage.sync.get(null, function(opt) {
      var result = sendToPlaylist(req.src, opt.dest);

      sendRes({ tab: req.src, opt: opt, res: result });
    });
    return true;
});

function sendToPlaylist(media, playlistURL) {
  var xhr = new XMLHttpRequest(),
      method = 'POST';

  xhr.addEventListener("load", function(e) {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.staus == 302)
      return true;
  });
  xhr.addEventListener("error", function(e) {
    console.error(e);
    return false;
  });

  xhr.open(method, playlistURL);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send('url=' + encodeURIComponent(media));
}
