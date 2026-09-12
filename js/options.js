function save_options() {
  chrome.storage.sync.set({
    dest: document.getElementById('dest').value,
    source: document.getElementById('source').value,
    output: document.getElementById('output').checked
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'SAVED!';
    status.style.display = 'block';
    setTimeout(function() {
      status.style.display = 'none';
    }, 2000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    dest: '',
    source: '',
    output: false
  }, function(opt) {
    document.getElementById('dest').value = opt.dest;
    document.getElementById('source').value = opt.source;
    document.getElementById('output').checked = opt.output;
    document.getElementById('dest').disabled = !opt.output;
    document.getElementById('source').disabled = !opt.output;
  });
}

function import_bookmark() {
  var bookmark = document.getElementById('bookmark');
  var query = bookmark.value;
  bookmark.classList.remove('error');
  hideMessages();

  if (!query || query == '') {
    bookmark.classList.add('error');
    show('error', 'Please enter a folder name.');
  } else {
    chrome.bookmarks.search({ title: query }, function(folders) {
      if (folders.length == 0) show('error', 'Folder ('+query+') not found.');
      else if (folders.length > 1) show('error', 'Multiple folders found matching: '+query);
      else {
        chrome.bookmarks.getChildren(folders[0].id, function(pages) {
          if (pages.length == 0) show('error', 'Folder is empty.');
          else
            pages.forEach(sendToPlaylist);
        });
      }
    });
  }
}

function sendToPlaylist(el, index, array) {
  chrome.runtime.sendMessage({
    event: 'sendToPlaylist',
    src: el.url
  }, function(res) {
    show('result', 'Sent ' + res.tab + ' to ' + res.opt.dest);
  });
}

function show(type, text) {
  var area = document.getElementById(type);
  var div = document.createElement('div');
  div.textContent = text;
  area.appendChild(div);
  area.style.display = 'block';
}

function hideMessages() {
  var types = ['error', 'result'];
  types.forEach(function(type) {
    var area = document.getElementById(type);
    area.style.display = 'none';
    area.querySelectorAll('div').forEach(function(div) {
      div.remove();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restore_options();

  document.getElementById('output').addEventListener('change', function(e) {
    document.getElementById('dest').disabled = !this.checked;
    document.getElementById('source').disabled = !this.checked;
  });

  document.getElementById('save').addEventListener('click', save_options);
  document.getElementById('import').addEventListener('click', import_bookmark);
});
