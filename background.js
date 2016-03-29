var total = 0;

var isMedia = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      contentType: ['audio/mpeg', 'video/webm'] })
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message: 'found media'})
  ]
};


chrome.declarativeWebRequest.onRequest.removeRules(undefined, function() {
  chrome.declarativeWebRequest.onRequest.addRules([isMedia]);
});

chrome.declarativeWebRequest.onMessage.addListener(function(details) {
  chrome.tabs.get(details.tabId, function(tab) { details.tabURL = tab.url; });

  chrome.pageAction.show(details.tabId);
  chrome.pageAction.onClicked.addListener(function(tab) {
    console.info(details);
  });
});


/////////////////////////////
/////////////////////////////

// chrome.webRequest.onResponseStarted.addListener(function(details) {
//   var headers = details.responseHeaders;
//   var media_headers = headers.filter(isMedia);

//   if (media_headers.length > 0) {
//     chrome.tabs.get(details.tabId, function(tab) {
//       if (~tab.title.indexOf('localhost')) return;

//       console.groupCollapsed (tab.title);
//       console.log(tab.url);
//       console.log(details.url);
//       console.groupEnd();

// //         var xhr = new XMLHttpRequest();
// //         xhr.open('POST', 'http://localhost:3000/playlist');
// //         xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
// //         xhr.send('url=' + tab.url);
// //         xhr.send('url=' + encodeURIComponent(details.url));
//     });

//     total += 1;
//     chrome.browserAction.setBadgeText({text: total.toString()});
//   }
// },
// {urls: [
//   "<all_urls>"
// //     "*://youtube.com/*",
// //     "*://*.tumblr.com/*",
// //     "*://*.bandcamp.com/*",
// //     "*://*.bcbits.com/*",
// //     "*://*.googlevideo.com/*"
// ]},
// ["responseHeaders"]
// );
