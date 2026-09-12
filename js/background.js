// Bandcamp-style sites point an <audio> element straight at an mp3, which Chrome
// reports as a 'media' request. YouTube and SoundCloud instead use Media Source
// Extensions: the element's src is a blob: URL and the real bytes arrive as
// 'xmlhttprequest' segment fetches. So we watch both types and score what we see,
// keeping the best candidates per tab instead of letting the last request win.

var MAX_CANDIDATES = 8;
var MIN_SCORE_TO_SHOW = 50;

var MANIFEST_RE = /\.(m3u8|mpd)(\?|#|$)/i;
var SEGMENT_RE = /\.(m4s|ts)(\?|#|$)/i;
var MEDIA_FILE_RE = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba|mp4|m4v|webm|mov)(\?|#|$)/i;
// YouTube's own static assets include short UI sound effects that would
// otherwise outrank the actual video stream.
var UI_ASSET_RE = /^https?:\/\/[^/]*\byoutube\.com\/s\//i;

// Range/segment params turn a googlevideo URL into one chunk of the stream.
// Dropping them (and the UMP wrappers) gives a URL for the whole thing.
var GOOGLEVIDEO_STRIP = ['range', 'rn', 'rbuf', 'sq', 'ump', 'srfvp', 'sabr'];

function mediaKey(tabId) {
  return 'media_' + tabId;
}

function classify(url, resourceType) {
  if (!/^https?:/i.test(url) || UI_ASSET_RE.test(url))
    return null;

  if (MANIFEST_RE.test(url))
    return { url: url, key: url, kind: 'stream', score: 100 };

  if (/googlevideo\.com\/videoplayback/i.test(url))
    return classifyGoogleVideo(url);

  // A 'media' request is the element asking for its own source, so it is
  // already the whole file (this is the Bandcamp case).
  if (resourceType === 'media' && !SEGMENT_RE.test(url))
    return { url: url, key: url, kind: kindFromExt(url), score: 80 };

  if (MEDIA_FILE_RE.test(url))
    return { url: url, key: url, kind: kindFromExt(url), score: 70 };

  // Individual HLS/DASH segments are only useful if we never see a manifest.
  if (SEGMENT_RE.test(url))
    return { url: url, key: url.replace(/[^/]*$/, ''), kind: 'segment', score: 20 };

  return null;
}

function classifyGoogleVideo(url) {
  var parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return null;
  }

  GOOGLEVIDEO_STRIP.forEach(function(param) {
    parsed.searchParams.delete(param);
  });

  var mime = parsed.searchParams.get('mime') || '';
  var itag = parsed.searchParams.get('itag');
  var kind = mime.indexOf('audio') === 0 ? 'audio' : (mime.indexOf('video') === 0 ? 'video' : 'stream');

  var candidate = {
    url: parsed.toString(),
    // One key per stream so the hundreds of segment requests collapse into
    // a single candidate; audio and video are separate streams here.
    key: 'gv:' + parsed.searchParams.get('id') + ':' + itag,
    kind: kind,
    score: 90
  };

  // Streams with no itag are YouTube's SABR protocol: the format is negotiated
  // in a POST body, so the URL alone returns 403 outside the player.
  if (!itag)
    candidate.note = 'session-bound, will not play outside the browser — use the page URL';

  return candidate;
}

function kindFromExt(url) {
  if (/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba)(\?|#|$)/i.test(url)) return 'audio';
  if (/\.(mp4|m4v|webm|mov)(\?|#|$)/i.test(url)) return 'video';
  // Plenty of CDNs serve extension-less URLs (Bandcamp's are /stream/<hash>/mp3-128/<id>),
  // so fall back to a format hint anywhere in the path.
  var path = url.split('?')[0];
  if (/(^|[^a-z])(mp3|m4a|aac|opus|flac|wav|ogg)([^a-z]|$)/i.test(path)) return 'audio';
  if (/(^|[^a-z])(mp4|webm|h264|avc1)([^a-z]|$)/i.test(path)) return 'video';
  return 'media';
}

function rank(a, b) {
  return (b.score - a.score) || (b.ts - a.ts);
}

// Overlapping requests can each read the list before either writes it back,
// which would let the same stream land twice.
function dedupe(candidates) {
  var seen = {};
  return candidates.filter(function(c) {
    if (seen[c.key]) return false;
    seen[c.key] = true;
    return true;
  });
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.action.disable();
});
chrome.runtime.onStartup.addListener(function() {
  chrome.action.disable();
});

chrome.webRequest.onBeforeRequest.addListener(
  function(request) {
    if (request.tabId < 0)
      return;

    var found = classify(request.url, request.type);
    if (!found)
      return;

    var key = mediaKey(request.tabId);
    chrome.storage.session.get(key, function(stored) {
      var entry = stored[key] || { tab: '', candidates: [] };
      var existing = entry.candidates.filter(function(c) { return c.key === found.key; })[0];

      // A playing stream fires a segment request every few seconds, all of which
      // canonicalize to the same URL. Skip the write once it is already on top.
      if (existing && existing.url === found.url && entry.candidates[0].key === found.key) {
        chrome.action.enable(request.tabId);
        return;
      }

      if (existing) {
        // Refresh the URL: later segments carry newer expiry/signature params.
        existing.url = found.url;
        existing.ts = Date.now();
      } else {
        found.ts = Date.now();
        entry.candidates.push(found);
      }

      entry.candidates.sort(rank);
      entry.candidates = dedupe(entry.candidates).slice(0, MAX_CANDIDATES);

      chrome.tabs.get(request.tabId, function(tab) {
        if (!chrome.runtime.lastError && tab)
          entry.tab = tab.url;

        var update = {};
        update[key] = entry;
        chrome.storage.session.set(update, function() {
          if (entry.candidates[0] && entry.candidates[0].score >= MIN_SCORE_TO_SHOW)
            chrome.action.enable(request.tabId);
        });
      });
    });
  },
  // filters
  {
    urls: ['https://*/*', 'http://*/*'],
    types: ['media', 'xmlhttprequest']
  },
);

// YouTube and SoundCloud navigate without reloading, so clear stale media
// whenever the tab's URL changes rather than only on load.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (!changeInfo.url)
    return;
  chrome.storage.session.get(mediaKey(tabId), function(stored) {
    var entry = stored[mediaKey(tabId)];
    if (!entry || entry.tab === changeInfo.url)
      return;
    chrome.storage.session.remove(mediaKey(tabId));
    chrome.action.disable(tabId);
  });
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.storage.session.remove(mediaKey(tabId));
});

chrome.runtime.onMessage.addListener(
  function(req, sender, sendRes) {
    if (req.event !== 'getMedia')
      return;
    chrome.storage.sync.get(null, function(opt) {
      chrome.storage.session.get(mediaKey(req.tabId), function(stored) {
        var entry = stored[mediaKey(req.tabId)] || { tab: '', candidates: [] };
        var best = entry.candidates[0];
        var src = (opt.source == 'MEDIA URL') ? (best && best.url) : entry.tab;

        if (opt.output && src)
          sendToPlaylist(src, opt.dest);

        sendRes({
          tab: entry.tab,
          media: best && best.url,
          candidates: entry.candidates,
          opt: opt
        });
      });
    });
    return true;
});

chrome.runtime.onMessage.addListener(
  function(req, sender, sendRes) {
    if (req.event !== 'sendToPlaylist')
      return;
    chrome.storage.sync.get(null, function(opt) {
      sendToPlaylist(req.src, opt.dest).then(function(result) {
        sendRes({ tab: req.src, opt: opt, res: result });
      });
    });
    return true;
});

function sendToPlaylist(media, playlistURL) {
  return fetch(playlistURL, {
    method: 'POST',
    headers: { 'Content-type': 'application/json;' },
    body: JSON.stringify({ 'url': media })
  })
  .then(function(res) {
    return res.ok;
  })
  .catch(function(e) {
    console.error(e);
    return false;
  });
}
