var appWindow;
var appOrigin;

var script = document.createElement("script");
script.src = "https://www.google.com/jsapi";
script.addEventListener('load', pickerReady, true);
document.head.appendChild(script);

function pickerReady() {
  google.load('picker', '1', {"callback": createPicker});
}

function createPicker() {
  // Lots of timeouts, because google.load destroys document.body at some point
  setTimeout(function() {
    document.body = document.createElement('body');
    setTimeout(function() {
      var view = new google.picker.View(google.picker.ViewId.DOCS);
      var rpview = new google.picker.View(google.picker.ViewId.RECENTLY_PICKED);
      var mimeTypes = "text/plain,text/html,text/javascript";
      view.setMimeTypes(mimeTypes);
      rpview.setMimeTypes(mimeTypes);
      window.picker = new google.picker.PickerBuilder().
        addView(view).
        addView(rpview).
        addView(new google.picker.DocsUploadView()).
        setCallback(pickerCallback).
        build();
      window.picker.setVisible(true);
    },0);
  }, 0);
}

window.addEventListener('message', function(event) {
  if (!appWindow) {
    appWindow = event.source;
    appOrigin = event.origin;
  }
});

function pickerCallback(data) {
  var url = 'nothing';
  console.log("got event " + data[google.picker.Response.ACTION]);
  if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    var doc = data[google.picker.Response.DOCUMENTS][0];
    console.log(doc);
    appWindow.postMessage({name: "picked", id: doc[google.picker.Document.ID]}, appOrigin);
  } else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
    appWindow.postMessage({name: "picked", id: 'nothing'}, appOrigin);
  }
}
