var ORIGIN = "https://homes.cs.washington.edu";

window.addEventListener('load', function() {
	window.googleChannel = null;
	window.topChannel = null;

	window.addEventListener('message', function(event) {
		if (event.source == window.googleChannel) {
			window.topChannel.postMessage(event.data, '*');
		} else {
			if (!event.source) {
				event.source.postMessage({"name":"open", "partner": "https://homes.cs.washington.edu/~wrs/drivecode/web.html"}, '*');
			}
			window.topChannel = event.source;
			if (!window.googleChannel) {
				window.googleChannel = function() {return event.data;};			
			} else {
				window.googleChannel.postMessage(event.data, /*ORIGIN*/'*');
			}
		}
	});
	
	loadGoogleChannel();
}, true);

function loadGoogleChannel() {
	var el = document.createElement("iframe");
	el.src = "https://homes.cs.washington.edu/~wrs/drivecode/sandbox.html";
	el.style.position = "absolute";
	el.style.left = "-100px";
	el.style.width = "10px";
	document.body.appendChild(el);
	el.addEventListener('load', function() {
		var i = null
		if (typeof window.googleChannel == "function") {
			i = window.googleChannel();
		}
		window.googleChannel = el.contentWindow;
		if (i) {
			window.googleChannel.postMessage(i, /*ORIGIN*/'*');
		}
	}, true);
}