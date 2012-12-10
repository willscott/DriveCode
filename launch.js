var ORIGIN = "https://homes.cs.washington.edu";
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
	var tVal = chrome.storage.sync.get("theme", function(r) {
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
	});
}

var mode_ext_map = {
"clike": ["c", "cpp", "h", "hpp", "c++", "java", "m", "cs", "scala"],
"clojure": ["clj"],
"coffeescript": ["coffee"],
"commonlisp": ["cl", "lisp"],
"css": ["css"],
"diff": ["diff","patch"],
"ecl": ["ecl"],
"erlang": ["erl"],
"gfm": ["md"],
"go": ["go"],
"groovy": ["groovy"],
"haskell": ["hs"],
"haxe": ["hx"],
"htmlembedded": ["jsp", "cs"],
"htmlmixed": ["html"],
"javascript": ["js", "json"],
"jinja2": [],
"less": ["less"],
"lua": ["lua"],
"markdown": ["md"],
"mysql": ["sql"],
"ntriples": ["nt"],
"ocaml": ["ocaml"],
"pascal": ["pas", "pascal"],
"perl": ["pl", "pm"],
"php":["php","phps"],
"pig": ["pig"],
"plsql":["sql"],
"properties": ["plist"],
"python":["py"],
"r": ["r"],
"rst": ["rst"],
"ruby":["rb"],
"rust": ["rust"],
"scheme": ["ss","scm"],
"shell":["sh","bash"],
"sieve": ["sieve"],
"smalltalk": ["st"],
"smarty": ["tpl"],
"sparql": ["rq"],
"stex": ["tex"],
"tiddlywiki": [],
"tiki": [],
"vb": ["vb"],
"vbscript": ["vbs"],
"velocity": ["vsl"],
"verilog": ["v", "vh"],
"xml": ["xml", "xslt"],
"xquery": ["xquery"],
"yaml": ["yaml"],
"z80": ["z80"]
};

function setupMode() {
	var mode = document.createElement("script");
	CodeMirror.modeURL = "CodeMirror/mode/%N/%N.js";
	mode.src = "CodeMirror/lib/util/loadmode.js";
	mode.addEventListener('load', function() {
		var select = document.getElementById("mode");
		for (var type in mode_ext_map) {
			select.add(new Option(type, type));
		}
		select.addEventListener('change', function() {
			var newVal = select.options[select.selectedIndex].innerHTML;
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
	}, ORIGIN);
}

function setupTitle() {
	var title = document.getElementsByTagName("h1")[0];
	title.addEventListener('click', function() {
		var newTitle = prompt("Input Title", title.innerText);
		if (newTitle && newTitle != title.innerText) {
			dirty = true;
			activeMetaData.title = newTitle;
			updateTitle(newTitle);
			updateSave();
		}
	}, true);
}

function updateTitle(newTitle) {
	window.title = newTitle;
	document.getElementsByTagName("h1")[0].innerText = newTitle;
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
	el.src = "CodeMirror/lib/codemirror.js";
	el.addEventListener('load', continuation, true);
	document.body.appendChild(el);
}

function loadGoogleChannel() {
	var el = document.createElement("iframe");
	el.src = "https://homes.cs.washington.edu/~wrs/drivecode/api.html";
	el.style.position = "absolute";
	el.style.left = "-100px";
	el.style.width = "10px";
	document.body.appendChild(el);
	el.addEventListener('load', openGoogleChannel, true);
	window.googleChannel = el.contentWindow;
}

function openGoogleChannel() {
	window.addEventListener('message', function(event) {
		if (event.data.name == "ready") {
			if (initialState.action && initialState.action == "open") {
				window.googleChannel.postMessage({command: "open", id:initialState.ids[0]}, ORIGIN);
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
	}, ORIGIN);
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