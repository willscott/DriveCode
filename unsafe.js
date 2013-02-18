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
    //console.log(event);
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

var authstate = 0;
function checkAuth(continuation) {
  if (window.gapi == undefined && authstate < 1) {
    authstate = 1;
    console.log("loading GAPI");
    var script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.addEventListener('load', checkAuth.bind(this, continuation), true);
    document.body.appendChild(script);
    return;
  } else if (window.gapi.auth == undefined && authstate < 2) {
    authstate = 2;
    console.log("waiting for GAPI auth");
    window.gapi.load("auth", checkAuth.bind(this, continuation));
  } else if (authstate < 3){
    authstate = 3;
    console.log("waiting for GAPI authorization");
    window.gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPE,
      'immediate': true}, handleAuthResult.bind(this, continuation));
  }
}

function handleAuthResult(continuation, authResult) {
  if (authResult && authstate < 5) {
    authstate = 5;
    console.log("Successful Auth");
    window.gapi.client.load('drive', 'v2', continuation);
  } else if (authstate < 4) {
    authstate = 4;
    console.log("Unsuccessful Auth");
    // No access token could be retrieved, force the authorization flow.
    window.gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPE,
      'immediate': false}, handleAuthResult.bind(this, continuation));
  }
}
