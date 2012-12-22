var initialState = null;

var CLIENT_ID = '1230779730-r091mnd3tvv89ecolu1mtlb34qomopri.apps.googleusercontent.com';
var SCOPE = 'https://www.googleapis.com/auth/drive.file';

function postMessage(msg) {
	window.localStorage['message'] = msg;
}

window.addEventListener('storage', function(evt) {
	var command = evt.newValue.command;
	if (command == "authorize") {
		var onSuccess = function(s) {
			console.log("posting message");
			postMessage({name: "ready"}, '*');
		};
		checkAuth(onSuccess);
	} else if (command == "open") {
		var req = gapi.client.drive.files.get({'fileId': evt.newValue.id});
		req.execute(function(resp) {
			console.log(resp);
			if (!resp.error) {
				postMessage({name: "meta", meta: resp}, '*');
				download(resp.downloadUrl);
			}
		});
	} else if (command == "save") {
		upload(evt.newValue.meta, evt.newValue.file);
	}
}, false);

function insert(meta, base64Data) {
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";

	meta.title = meta.title || 'untitled.txt';
	meta.mimeType = meta.mimeType || 'text/plain';
	var ctype = meta.mimeType;
	var multipartRequestBody =
	       delimiter +
	       'Content-Type: application/json\r\n\r\n' +
	       JSON.stringify(meta) +
	       delimiter +
	       'Content-Type: ' + ctype + '\r\n' +
	       'Content-Transfer-Encoding: base64\r\n' +
	       '\r\n' +
	       base64Data +
	       close_delim;

	var request = gapi.client.request({
	      'path': '/upload/drive/v2/files',
	      'method': 'POST',
	      'params': {'uploadType': 'multipart'},
	      'headers': {
	        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
	      },
	      'body': multipartRequestBody});
	request.execute(function(resp) {
		console.log(resp);
		if (!resp.error) {
			postMessage({name: "meta", meta: resp}, '*');
		}
	});
}

function upload(meta, file) {
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";
	var base64Data = btoa(unescape(encodeURIComponent(file)));
	var ctype = meta.mimeType;
	var fileId = meta.id;
	if (!fileId)
	return insert(meta, base64Data);
	var multipartRequestBody =
	    delimiter +
	        'Content-Type: application/json\r\n\r\n' +
	        JSON.stringify(meta) +
	        delimiter +
	    'Content-Type: ' + ctype + '\r\n' +
	    'Content-Transfer-Encoding: base64\r\n' +
	    '\r\n' +
	    base64Data +
	    close_delim;
	var request = gapi.client.request({
	      'path': '/upload/drive/v2/files/' + fileId,
	      'method': 'PUT',
	      'params': {'uploadType': 'multipart', 'alt': 'json'},
	      'headers': {
	        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
	      },
	      'body': multipartRequestBody});
	request.execute(function(resp) {
		console.log(resp);
		if (!resp.error) {
			postMessage({name: "meta", meta: resp}, '*');
		}
	});
}

function download(file, s) {
	var callback = function(resp) {
		s.postMessage({name: "data", data:resp}, '*');
	}
	if (file) {
	    var accessToken = gapi.auth.getToken().access_token;
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', file);
	    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	    xhr.onload = function() {
	      callback(xhr.responseText);
	    };
	    xhr.onerror = function() {
	      callback(null);
	    };
	    xhr.send();
	} else {
	  callback(null);
	}
}

function checkAuth(continuation) {
	gapi.auth.authorize(
	            {'client_id': CLIENT_ID, 'scope': SCOPE, 'immediate': true},
	            handleAuthResult.bind(this, continuation));
}

function handleAuthResult(continuation, authResult) {
  if (authResult) {
		gapi.client.load('drive', 'v2', continuation);
  } else {
    // No access token could be retrieved, force the authorization flow.
    gapi.auth.authorize(
        {'client_id': CLIENT_ID, 'scope': SCOPE, 'immediate': false},
        handleAuthResult.bind(this, continuation));
  }
}
