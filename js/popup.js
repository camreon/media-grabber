function setDOMInfo(info) {
  $('#tabURL').text(info.tab);
  $('#mediaURL').text(info.media);
  if (info.opt.dest !== undefined) $('#dest').text(info.opt.dest);
  if (info.opt.source !== undefined) $('#src').text(info.opt.source);
  if (!info.opt.output) $('#output').hide();

  $('#dest').on('click', function() {
    var dest_url = new URL(info.opt.dest);
    window.open(dest_url.origin);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.runtime.sendMessage({
      event: 'getMedia',
      tabId: tabs[0].id
    }, setDOMInfo);
  });
});

$('#go-to-options').on('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});
