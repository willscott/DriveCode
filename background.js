chrome.app.runtime.onLaunched.addListener(function(intent) { 
	chrome.app.window.create('launch.html', {
	    width: 800,
	    height: 600,
	    minWidth: 640,
	    minHeight: 480,
	    type: 'shell'
	});
});