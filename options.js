function save_options() {
  var url = document.getElementById('playlistURL').value;

  chrome.storage.sync.set({
    playlistURL: url
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    playlistURL: "" // default value
  }, function(items) {
    document.getElementById('playlistURL').value = items.playlistURL;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);