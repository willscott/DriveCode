var appWindow;
var appOrigin;

var CLIENT_ID = '403513397760-8f21lgjeku38tckvfjejjihrvqpg7ip2.apps.googleusercontent.com';
var SCOPE = 'https://www.googleapis.com/auth/drive.file';

// Override window.open to handle interactive auth requests.
window.open = function(url) {
  appWindow.postMessage({name: "needauth", url: url}, appOrigin);
}

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
      document.body.style.background = "green";
      checkAuth(function() {
        appWindow.postMessage({name: "ready"}, appOrigin);
      });
      break;
    case "open":
      
      break;
    case "":
    default:
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
    console.log("waiting for GAPI to initialize");
    window.gapi.load("auth:client,drive-realtime,drive-share", checkAuth.bind(this, continuation));
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
    console.log("Authorization complete. Loading drive.");
    window.gapi.client.load('drive', 'v2', continuation);
  } else if (authstate < 4) {
    authstate = 4;
    console.log("Couldn't authorize automatically, beginning interactive authorization.");
    // No access token could be retrieved, force the authorization flow.
    window.gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPE,
      'immediate': false}, handleAuthResult.bind(this, continuation));
  }
}
