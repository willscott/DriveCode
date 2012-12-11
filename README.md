# DriveCode

A [CodeMirror](http://codemirror.net) text editor UI for Google Drive.

## To Do

1. Remove URL Limitations.

   The extension currently uses static web pages with a cache manifest, since the Drive API is unwilling to direct
   to a chrome extension directly.  Hopefully a work-around can be found.

   Similarly, a web page is used for communication with google, so that requests has a domain associated with them,
   This limitation should also be removed.

2. Keymaps
3. Title editing is ugly
4. Tab preferences (# spaces, soft tabs)
5. Localization