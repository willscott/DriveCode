# DriveCode

A [CodeMirror](http://codemirror.net) text editor UI for Google Drive.

## Connect

DriveCode is available for installation on the [Chrome Web Store](https://chrome.google.com/webstore/detail/drivecode/cafaeenamnaaddgainjldnlhikikobpd).
Feel free to file Issues (or Pull Requests!) here, or interact with DriveCode on [Google+](https://plus.google.com/b/100255334116155747183/).

## To Do

1. Update to new-school app.

	* Different Launch setup
	* Different iFrame / webview / sandbox layout.
	* Lay out a model for offline-first
	
2. Overcome URL Restrictions.

   The extension currently uses a static web page with cache manifest to interact with drive, since the Google APIs are unwilling to
   interact with a chrome extension directly.
   
   Bugs:
   https://code.google.com/p/google-api-javascript-client/issues/detail?id=64
   https://plus.google.com/111745366298188139351/posts/HZVJavKywFX

3. Preference Panel:
	* Keymaps
	* Tab preferences
	* Keymaps
	* Line Wrapping
4. Localization.
5. Onboarding Experience.
