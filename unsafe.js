var appWindow;
var appOrigin;

var CLIENT_ID = '403513397760-8f21lgjeku38tckvfjejjihrvqpg7ip2.apps.googleusercontent.com';
var SCOPE = 'https://www.googleapis.com/auth/drive.file';

window.addEventListener('message', function(event) {
  if (!appWindow) {
    appWindow = event.source;
    appOrigin = event.origin;
  }
  if (!event.data || !event.data.command) {
    console.log(event);
    return;
  }
  switch (event.data.command) {
    case "authorize":
      checkAuth(function() {
        appWindow.postMessage({name: "ready"}, appOrigin);
      });
      break;
    case "":
    break;
  }
  
});

function checkAuth(continuation) {
  if (typeof gapi === 'undefined') {
    var script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.addEventListener('load', checkAuth.bind(this, continuation), true);
    document.body.appendChild(script);
    return;
  }
  gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPE,
    'immediate': true}, handleAuthResult.bind(this, continuation));
}

function handleAuthResult(continuation, authResult) {
  if (authResult) {
    gapi.client.load('drive', 'v2', continuation);
  } else {
    // No access token could be retrieved, force the authorization flow.
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPE,
      'immediate': false}, handleAuthResult.bind(this, continuation));
  }
}
