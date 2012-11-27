/**
 * DriveCode Redirector.
 *
 * Redirect into the extension.
 */
var appHome = chrome.extension.getURL("launch.html");
var query = window.location.search;
window.location.href = appHome + query;