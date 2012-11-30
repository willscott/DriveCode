var ORIGIN = "https://homes.cs.washington.edu";
var initialState = {};
var editor = null;
var activeMetaData = {
	mime: "text/plain"
};

window.addEventListener('load', function() {
	var continuation = function() {
		var el = document.getElementById("editor");
		editor = CodeMirror(el, {
			lineNumbers: true,
			onCursorActivity: updateStatus
		});
		
		// Hook up the theme.
		setupTheme();
		// Hook up the mode.
		setupMode();
		// Hook up saved status.
		
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
			chrome.storage.sync.set({"theme":newVal}, function() {});
		}, true);
		editor.setOption("theme", val);
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
"javascript": ["js"],
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
			CodeMirror.autoLoadMode(editor, newVal);
			editor.setOption("mode", newVal);
		}, true);
	}, true);
	document.body.appendChild(mode);
}

function updateStatus(editor) {
	var coords = editor.cursorCoords(true, "page");
	var pos = editor.coordsChar(coords);
	var string = "Line: " + (pos.line + 1) + " Column: " + (pos.ch + 1);
	document.getElementById('info').innerText = string;
}

function editorSave() {
	if (!editor) return;
	window.googleChannel.postMessage({
		command: "save",
		meta: activeMetaData,
		file: editor.getValue()
	}, ORIGIN);
}

function loadCodeMirror(continuation) {
	var el = document.createElement("script");
	el.src = "CodeMirror/lib/codemirror.js";
	el.addEventListener('load', continuation, true);
	document.body.appendChild(el);
}

function loadGoogleChannel() {
	var el = document.createElement("iframe");
	el.src = "https://homes.cs.washington.edu/~wrs/drivecode.html";
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
				document.getElementsByTagName("h1")[0].innerText = "untitled.txt";
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
			document.getElementsByTagName("h1")[0].innerText = activeMetaData.title;
		} else if (event.data.name == "data") {
			if (editor) {
				editor.setValue(event.data.data);
			}
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