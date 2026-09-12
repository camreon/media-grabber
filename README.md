# Media Grabber
chrome extension to get the media URL of a page's most recently played audio/video (and then do something with it).

#### usage
1. install from [chrome web store](https://chrome.google.com/webstore/detail/audio-history/ompogmmmcfgapifeghieaklpblkkoloo?hl=en-US&gl=US)
2. click pageAction icon in menu bar to:
    1. copy/paste the displayed audio URL
    2. automatically send it to an external source (configured in Options)

#### what gets detected
Sites that point an `<audio>`/`<video>` element straight at a file (Bandcamp) expose that
file's URL directly. Sites built on Media Source Extensions (SoundCloud, YouTube) set the
element's `src` to a `blob:` URL and stream the real bytes as segment requests, so the
extension watches those too and reports the stream they belong to rather than any one segment.

The popup lists every stream found on the page, labelled by kind, best first:

| site | what you get | usable outside the browser |
|---|---|---|
| Bandcamp | the mp3 URL | yes |
| SoundCloud | the HLS `playlist.m3u8` | yes — `ffmpeg`/`vlc`/`yt-dlp` accept it |
| YouTube | the `videoplayback` stream | **no** — see below |

YouTube now serves media over SABR, where the format is negotiated in a POST body and the
URL alone returns `403` outside the player. The extension flags these in the popup. For
YouTube, set **source** to `PAGE URL` and let something like `yt-dlp` resolve the watch URL.

Signed URLs from SoundCloud and YouTube also carry an expiry, so grab them while the page is open.

#### options
1. **source** - choose to send the media URL or the page's URL
2. **destination** - where the source is POSTed to on pageAction click (example destination: [UMQ](https://github.com/camreon/UMQ))
3. **enabled** - turn on/off sending the audio URL to an external source

#### import
1. enter the name of a bookmark folder
2. send the URLs of all contained bookmarks to the destination

---

#### The MIT License (MIT)
```
Copyright (c) 2016 Cameron Guthrie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
