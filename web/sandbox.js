var source;

window.addEventListener('storage', function(evt) {
	if (source) {
		source.postMessage(evt.newValue, '*');
	}
}, false);

window.addEventListener('message', function(msg) {
	if (!source) {
		source = msg.source;
	}
	window.localStorage['message'] = msg.data;
});