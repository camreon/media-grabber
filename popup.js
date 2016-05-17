function setDOMInfo(info) {
  document.getElementById('tabURL').textContent = info.tab;
  document.getElementById('mediaURL').textContent = info.media;
//   document.getElementById('playlist').textContent = info.playlist;
  document.getElementById('sent').textContent = info.sent;
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.runtime.sendMessage({event: 'getMedia', tabId: tabs[0].id}, setDOMInfo);
  });
});

// open options page
document.getElementById('go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});