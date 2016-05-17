function save_options() {
  var url = document.getElementById('playlistURL').value;
  var use = document.getElementById('usePlaylist').checked;

  chrome.storage.sync.set({
    playlistURL: url,
    usePlaylist: use
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    playlistURL: "",
    usePlaylist: false 
  }, function(items) {
    document.getElementById('playlistURL').value = items.playlistURL;
    document.getElementById('playlistURL').disabled = !items.usePlaylist;
    document.getElementById('usePlaylist').checked = items.usePlaylist;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

document.getElementById('usePlaylist').onchange = function(e) {
  document.getElementById('playlistURL').disabled = !this.checked;
};