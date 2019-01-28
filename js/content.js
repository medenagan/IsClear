"use strict";

injectScript(

  function (send) {
    var data = window._sharedData;
    if (typeof data !== "object")
      throw new Error("Unable to detect data");

    var config = data.config;
    if (typeof config !== "object")
      throw new Error("Unable to detect config");

    var viewer = config.viewer;
    if (typeof viewer !== "object")
      throw new Error("Unable to detect viewer");

    send(viewer);
  },

  function (viewer) {
    chrome.runtime.sendMessage({changedViewer: viewer});
  }
);


/*
  con

*/

//Tabot.lowOnMessage = (message) => console.log("lowOnMessage", message);


//var x = new Tabot("https://it.wikipedia.org/wiki/Cher");

//console.log(x)


//Tabot.lowAddListener({url: "https://it.wikipedia.org/wiki/Schwa"}, (msg) => console.log("I am a listener!", msg));



//Tabot.lowAddListener({url: "https://it.wikipedia.org/wiki/Schwa"}, (msg) => console.log("I am a listener!", msg));

//Tabot.lowPostMessage({url: "https://it.wikipedia.org/wiki/Schwa"});

//var x = new Tabot("https://it.wikipedia.org/wiki/Fonologia");

//console.log(x);


//const sender = injectScript(() => console.log("This is supposed to happen in the script"));
