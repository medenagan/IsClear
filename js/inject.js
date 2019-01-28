"use strict";

// inject code into "the other side" to talk back to this side;
function injectScript (source, callback, keep) {

  if (typeof source !== "function")
    throw new Error("injectScript must be passed a function");

  if (typeof callback !== "function")
    callback = function () {return false};

  var wrappedSource = function () {

    /*
       (c) Fabio Mereu 2014
       MIT license
       https://github.com/medenagan/unsafe-window-inject
    */

    var sender = function (data) {
      // Dispatch a custom event packing Data
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent(_EVENT_KEY_, true, true, data);
      window.dispatchEvent(event);
    };

    // Call original script function passing a messanger
    _SOURCE_.call(null, sender);
  };

  // Create a unique key for this event
  var event_key = "inject_event_" +
    Math.floor(Math.random() * 1e15).toString(36) +
    Date.now().toString(36);

  // Add a listener for the custom event
  window.addEventListener(event_key, function (e) {
    callback.call(null, e.detail);
  });

  var script = document.createElement("SCRIPT");

  var compiled = String(wrappedSource)
    .replace("_SOURCE_", "(" + String(source) + ")")
    .replace("_EVENT_KEY_", '"' + event_key + '"');

  script.textContent = "(" + compiled + ")();";

  // Add the script as last head tag
  document.head.appendChild(script);

  // Remove the script after executing
  if (! keep) script.parentNode.removeChild(script);
}
