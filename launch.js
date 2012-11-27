window.addEventListener('load', function() {
	var continuation = function() {};
	if (window.location.search.length) {
		// Handle create / open request.
		var action = decodeURIComponent(window.location.search.substr(7));
		if (action.indexOf("&code=") > -1) {
			//Have an oAuth pipeline to complete
			var parts = action.split("&code=");
			action = parts[0];
			var code = parts[1];
			
		}
		
		
	} else {
		// Empty document.	
		continuation = function() {
			var editor = document.createElement("textarea");
			document.body.appendChild(editor);
			var realEditor = CodeMirror.fromTextArea(editor, {
				lineNumbers: true
			});
		}
	}
	loadCodeMirror(continuation);
}, true);

function loadCodeMirror(continuation) {
	var el = document.createElement("script");
	el.src = "CodeMirror/lib/codemirror.js";
	el.addEventListener('load', continuation, true);
	document.body.appendChild(el);
}