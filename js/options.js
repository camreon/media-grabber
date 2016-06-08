function save_options() {
  chrome.storage.sync.set({
    dest: $('#dest').val(),
    source: $('#source').val(),
    output: $('#output').prop('checked')
  }, function() {
    $('#status').show().text('SAVED!').delay(2000).fadeOut();
  });
}

function restore_options() {
  chrome.storage.sync.get({
    dest: '',
    source: '',
    output: false
  }, function(opt) {
    $('#dest').val(opt.dest);
    $('#source').val(opt.source);
    $('#output').prop('checked', opt.output);
    $('#dest, #source').prop('disabled', !opt.output);
  });
}

function import_bookmark() {
  var query = $('#bookmark').val();
  $('#bookmark').removeClass('error');
  hideMessages();

  if (!query || query == '') {
    $('#bookmark').addClass('error');
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
  var area = $('#'+type);
  area.append($('<div>'+text+'</div>')).show();
}

function hideMessages() {
  var types = ['error', 'result'];
  types.forEach(function(type, index, arr) {
    var area = $('#'+type);
    area.hide().find('div').remove();
  });
}

$(function() {
  restore_options();

  $('#output').change(function(e) {
    $('#dest, #source').prop('disabled', !this.checked);
  });

  $('#save').on('click', save_options);
  $('#import').on('click', import_bookmark);
});
