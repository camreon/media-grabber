var mediaStorage = [];

chrome.webRequest.onBeforeRequest.addListener(
  function(media) {
    console.log(media);
    
    chrome.tabs.get(media.tabId, function(tab) {
      mediaStorage[media.tabId] = { tab: tab.url, url: media.url };
    });
    chrome.pageAction.show(media.tabId);
  },
  // filters
  {
    urls: ['https://*/*', 'http://*/*'],
    types: ['media']
  },
);

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

  var data = { 'url': media };
  xhr.open(method, playlistURL);
  xhr.setRequestHeader('Content-type', 'application/json;');
  xhr.send(JSON.stringify(data));
}
