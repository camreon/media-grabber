function renderMedia(candidates) {
  var list = document.getElementById('mediaList');
  list.textContent = '';

  if (!candidates || !candidates.length) {
    list.textContent = 'N/A';
    return;
  }

  candidates.forEach(function(candidate) {
    var row = document.createElement('div');
    row.className = 'media-row';

    var label = document.createElement('span');
    label.className = 'kind';
    label.textContent = candidate.kind;
    row.appendChild(label);

    var body = document.createElement('div');
    body.className = 'body';

    // Streaming sites hand out long signed URLs, so make them selectable
    // rather than clickable — the point is to copy them out.
    var url = document.createElement('span');
    url.className = 'url';
    url.textContent = candidate.url;
    body.appendChild(url);

    if (candidate.note) {
      var note = document.createElement('span');
      note.className = 'note';
      note.textContent = candidate.note;
      body.appendChild(note);
    }

    row.appendChild(body);
    list.appendChild(row);
  });
}

function setDOMInfo(info) {
  document.getElementById('tabURL').textContent = info.tab || 'N/A';
  renderMedia(info.candidates);

  if (info.opt.dest !== undefined) document.getElementById('dest').textContent = info.opt.dest;
  if (info.opt.source !== undefined) document.getElementById('src').textContent = info.opt.source;
  if (!info.opt.output) document.getElementById('output').style.display = 'none';

  document.getElementById('dest').addEventListener('click', function() {
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

document.getElementById('go-to-options').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});
