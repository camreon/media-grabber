# Media Grabber Privacy Policy

_Last updated: September 13, 2026_

Media Grabber is a Chrome extension that shows you the URL of audio or video playing on a web page, and can optionally send that URL to a server you choose. This policy explains what data the extension handles, where it goes, and what it never does.

**The short version:** the developer runs no servers and receives none of your data. The extension has no analytics, ads, or tracking. Everything stays in your browser unless you set up a destination URL yourself, and even then it only sends a single URL to the address you entered.

## What the extension handles

### Web requests and page addresses
The extension needs to find media on a page, so it watches the addresses of media and background (XHR/fetch) requests made by the websites you visit. It checks each address against a list of audio/video patterns. Anything that isn't media is ignored on the spot and never stored.

When it does find media, it keeps:

- the media URL(s) found in that tab, and
- the address of the page they came from.

These are kept in Chrome's session storage, which lives only in memory on your device. They're deleted when you navigate away from the page, close the tab, or quit Chrome. They're never written to disk by the extension, and never sent anywhere unless you turn on sending (see below).

Some media URLs carry information from the website that served them. For example, YouTube stream URLs include your public IP address and time-limited access tokens. The extension doesn't add this information; it's part of the URL the website created.

### Your settings
The options you set are saved using Chrome's sync storage:

- **Destination**: the URL to send media to
- **Source**: whether to send the media URL or the page URL
- **Enabled**: whether sending is turned on

If Chrome sync is on for your Google account, Chrome syncs these settings between your own browsers. That sync is handled by Google under [Google's Privacy Policy](https://policies.google.com/privacy). The developer can't see it.

### Bookmarks
The extension reads your bookmarks only when you type a folder name on the Options page and click **Import from bookmarks**. Then it looks up that one folder and reads the addresses of the bookmarks inside it, so it can send them to your destination. It doesn't read, store, or change any other bookmarks.

## When data leaves your browser

Data only leaves your browser in two situations, and both go to the **destination URL you entered yourself**:

1. **Opening the popup with sending enabled.** If you've turned on **Enabled** and set a destination, opening the popup sends one URL (the detected media URL or the page URL, depending on your **Source** setting) to your destination.
2. **Importing from bookmarks.** Clicking **Import from bookmarks** sends the address of each bookmark in the folder you named to your destination.

Each request is an HTTP POST with a JSON body like `{"url": "..."}`. Like any web request, it also reaches that server with standard information your browser sends, such as your IP address.

The developer doesn't operate, choose, or have access to your destination. Whoever runs that server (you, or a service you picked) is responsible for what happens to the data there. If you never set a destination, the extension never sends anything.

## What the extension does not do

- It doesn't send any data to the developer or to any server the developer controls.
- It doesn't include analytics, crash reporting, advertising, or tracking code.
- It doesn't load or run code from outside the extension package.
- It doesn't sell your data or share it with advertisers, data brokers, or anyone else.
- It doesn't use your data for personalized ads, credit decisions, or lending.
- It doesn't collect names, email addresses, passwords, payment details, or page contents.

## Chrome Web Store User Data Policy

The use of information received from Google APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/policies), including the [Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use) requirements.

Media Grabber uses data only to find media URLs and send them where you tell it to. Nobody at the developer's end can read your data, because it never reaches the developer.

## Removing your data

- **Detected media:** close the tab or quit Chrome.
- **Settings:** clear the fields on the Options page, or uninstall the extension. Uninstalling removes all of the extension's stored data.
- **Data already sent to a destination:** contact whoever runs that server. The developer has no copy.

## Changes to this policy

If the extension starts handling data differently, this policy will be updated before that version is published, and the date at the top will change. You can see the full history of changes to this file in the [project repository](https://github.com/camreon/media-grabber/commits/master/PRIVACY.md).

## Contact

Questions about this policy can be raised by [opening an issue](https://github.com/camreon/media-grabber/issues) on the project's GitHub repository.
