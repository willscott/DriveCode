var partner = "https://wills.co.tt/bitbucket/dc.html";
var partnerOrigin = "https://wills.co.tt";

var initialState = {};
var editor = null;
var activeMetaData = {
	mime: "text/plain"
};
var data = "";
var dirty = false;
var autosave = false;
var autosaveTimeout = false

window.addEventListener('load', function() {
	var continuation = function() {
		var el = document.getElementById("editor");
		editor = CodeMirror(el, {
			lineNumbers: true,
			onCursorActivity: updateStatus,
			onChange: updateSave
		});
		
		// Hook up the theme.
		setupTheme();
		// Hook up the mode.
		setupMode();
		// Hook up saved status.
		setupSave();
		// Hook up title.
		setupTitle();
	};

	if (window.location.search.length) {
		// Handle create / open request.
  	var action = decodeURIComponent(window.location.search.substr(7));
		if (action.indexOf("&") > -1) {
			action = action.split("&")[0];
		}
		initialState = JSON.parse(action);
	}

	loadGoogleChannel();
	loadCodeMirror(continuation);
	bindKeys();
}, true);

function setupTheme() {
	var tVal = chrome.storage.sync.get(["theme", "tabs"], function(r) {
		//Theme
		var el = document.getElementById("theme");
		var val = r["theme"] || "default";
		el.value = val;
		el.addEventListener('change', function() {
			var newVal = theme.options[theme.selectedIndex].innerHTML;
			editor.setOption("theme", newVal);
			document.getElementById("header").className = "cm-s-" + newVal;
			chrome.storage.sync.set({"theme":newVal}, function() {});
		}, true);
		editor.setOption("theme", val);
		document.getElementById("header").className = "cm-s-" + val;
		
		//tab settings
		var tabel = document.getElementById("tabs");
		var val = r["tabs"] || "t4";
		tabel.value = val;
		tabel.addEventListener('change', function() {
			chrome.storage.sync.set({"theme": tabel.value}, function() {});
			editor.setOption("tabSize", parseInt(tabel.value.split('')[1]));
			editor.setOption("indentWithTabs", (tabel.value.split('')[0] == 't'));
		});
		editor.setOption("tabSize", parseInt(tabel.value.split('')[1]));
		editor.setOption("indentWithTabs", (tabel.value.split('')[0] == 't'));
	});
}

function setupMode() {
	var mode = document.createElement("script");
	CodeMirror.modeURL = "weborigin/CodeMirror/mode/%N/%N.js";
	mode.src = "weborigin/CodeMirror/lib/util/loadmode.js";
	mode.addEventListener('load', function() {
		var select = document.getElementById("mode");
		for (var type in mode_ext_map) {
			if (type in mode_alias_map) {
				var aliases = mode_alias_map[type];
				for(var i = 0; i < aliases.length; i++) {
					select.add(new Option(aliases[i], type));
				}
			} else {
				select.add(new Option(type, type));
			}
		}
		select.addEventListener('change', function() {
			var newVal = select.options[select.selectedIndex].value;
			updateMode(newVal);
		}, true);
	}, true);
	document.body.appendChild(mode);
}

function updateMode(newMode) {
	if (editor) {
		CodeMirror.autoLoadMode(editor, newMode);
		editor.setOption("mode", newMode);	
	}
	var el = document.getElementById("mode");
	el.value = newMode;
}

function setupSave() {
	document.getElementById("sdot").addEventListener('click', editorSave, true);
	chrome.storage.sync.get("autosave", function(r) {
		var el = document.getElementById("autosave");
		var val = r["autosave"] || false;
		autosave = val;
		if (val) {
			el.checked = true;
		}
		el.addEventListener('change', function() {
			autosave = el.checked;
			chrome.storage.sync.set({"autosave":el.checked}, function() {});
		}, true);
	});
}

function updateSave() {
	var el = document.getElementById("sdot");
	if ((editor.getValue() != data) || dirty) {
		el.className = "unsaved";
	} else {
		el.className = "";
	}
	// Set a timeout for autosave
	if (autosaveTimeout) {
		window.clearTimeout(autosaveTimeout);
	}
	autosaveTimeout = window.setTimeout(doAutosave, 500);
}

function doAutosave() {
	if (!autosave || !dirty) return;
	editorSave();
}

function editorSave() {
	if (!editor) return;
	window.googleChannel.postMessage({
		command: "save",
		meta: activeMetaData,
		file: editor.getValue()
	}, '*');
}

function setupTitle() {
	var title = document.getElementById("title");
	title.addEventListener('change', function() {
		if (title.value != activeMetaData.title) {
			dirty = true;
			activeMetaData.title = title.value;
			updateTitle(title.value);
			updateSave();
		}
	}, true);
}

function updateTitle(newTitle) {
	window.title = newTitle;
	var title = document.getElementById("title").value = newTitle;
	if (newTitle.indexOf(".") != -1) {
		var parts = newTitle.split(".");
		var ext = parts[parts.length - 1];
		for (var mode in mode_ext_map) {
			for (var i = 0; i < mode_ext_map[mode].length; i++) {
				if (mode_ext_map[mode][i] == ext) {
					updateMode(mode);
				}
			}
		}
	}
}

function updateStatus(editor) {
	var coords = editor.cursorCoords(true, "page");
	var pos = editor.coordsChar(coords);
	var string = "Line: " + (pos.line + 1) + " Column: " + (pos.ch + 1);
	document.getElementById('info').innerText = string;
}

function loadCodeMirror(continuation) {
	var el = document.createElement("script");
	el.src = "weborigin/CodeMirror/lib/codemirror.js";
	el.addEventListener('load', continuation, true);
	document.body.appendChild(el);
}

function loadGoogleChannel() {
	var el = document.createElement("webview");
	el.style.position = "absolute";
	el.style.top = "30px";
	el.style.left = "30px";
	el.style.width = "300px";
	document.body.appendChild(el);
  // 1. Load the holding page.
	el.setAttribute('src', partner);
  el.addEventListener('loadstop', function() {
    // 2. Request the script to inject.
    var req = new XMLHttpRequest();
    req.open("GET", "unsafe.js", true)
    req.onreadystatechange = function() {
      if(this.readyState == 4) {
        // 3. Inject the script.
        el.executeScript({
          code: this.responseText
        },
        // 4. Open the channel to the google API.
        openGoogleChannel);
      }
    }.bind(req);
    req.send();
    window.googleChannel = el.contentWindow;
  }, true);
}

function openGoogleChannel() {
	window.addEventListener('message', function(event) {
		if (event.data.name == "ready") {
			if (initialState.action && initialState.action == "open") {
				window.googleChannel.postMessage({command: "open", id: initialState.ids[0]}, partnerOrigin);
			} else {
				if (editor) {
					editor.setOption("readonly", false);
				}
				updateTitle("untitled.txt");
				if (initialState.action == "create") {
					activeMetaData.title = "untitled.txt";
					activeMetaData.parents = [initialState.parentId];
				}
			}
		} else if (event.data.name == "meta") {
			activeMetaData = event.data.meta;
			if (editor) {
				editor.setOption("readonly", !activeMetaData.editable);
			}
			updateTitle(activeMetaData.title);
			data = editor.getValue();
			dirty = false;
			updateSave();
		} else if (event.data.name == "data") {
			if (editor) {
				editor.setValue(event.data.data);
			}
			data = editor.getValue();
			dirty = false;
			updateSave()
		}
	});
	
	window.googleChannel.postMessage({
		command: "authorize"
	}, partnerOrigin);
}

function bindKeys() {
	window.addEventListener('keydown', function(key) {
		if (key.metaKey || key.ctrlKey) {
			if (key.which == 83) {// S
				editorSave();
				key.preventDefault();
				return false;
			}
		}
	}, false)
}
