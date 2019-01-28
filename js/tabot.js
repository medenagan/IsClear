/*

  Tabot.js

  18 november

*/

"use strict";

var Tabot = (() => {

  const hasChrome = (typeof chrome === "object");

  const hasBrowser = (typeof browser === "object");

  if (! (hasChrome || hasBrowser))
    throw new Error("Tabot: cannot detect any extension environment, aborting");

  const chromium = (hasChrome) ? (chrome) : (browser);

  const hasBackgroundPrivilege = (typeof chromium.runtime.onInstalled === "object");

  // FIXME
  if (hasBackgroundPrivilege && !chromium.tabs === "object") {
    throw new Error("Tabot: you must grant tabs permission on manifest file, aborting");
  }

  // example: randomKey() = "2bfr7lh9qi0bl5cd39wincriixz3tyahcgdzyr0x2" length is variable
  const randomKey = () => [0, 1, 2, 3].map(() => (Math.floor(Math.random() * 1e16)).toString(36)).join("");

  const addUniqueKey = (object, value) => {
    let key;

    while (key = randomKey(), object.hasOwnProperty(key)) { /**/ }

    return key;
  };

  // Should be used internally only
  let postServerRequest; // (request, stash) => ...

  // Can be used outside
  const lowPostMessage = (request) =>
    postServerRequest(request, {origin: "out-of-scope"});

  let onMessageFromClient;

  let lowOnMessageListener = null;

  const lowListeners = {};

  // Send a first request, then listen to the returned handle
  const lowAddListener = (request, callback) => {

    if (typeof callback !== "function") throw new Error("lowAddListener expects a function as listener");

    const hash = addUniqueKey(lowListeners, callback);
    lowListeners[hash] = callback;
    postServerRequest(request, {addHash: hash});
    return callback;
  }

  const lowRemoveListener = (callback) => {
   // if (typeof callback !== "function") throw new Error("lowListenToTabot must have a listern")
   // const listenerKey = addUniqueKey(lowListeners, callback);
   // callbacks[callbacks.length + 1] = callback;
   // postServerRequest(Objext.assign(request, {listenerKey}});
  }


  const onMessageFromServer = (message) => {

    const {request} = message;
    const {response} = message;
    const {stash} = message;

    const hashes = stash.hashes || [];

    console.log("TABOT: onMessageFromServer", "response", response, "stash", stash, "request", request);

    hashes.forEach( (hash) => {

      const listener = lowListeners[hash];

      if (listener) {
        listener.call(null, {request, response});
      }

      else console.error("TABOT: failed to trigger listener,"
                       + " callback for key " + hash
                       + " does not exist!", message);

    });

    (lowOnMessageListener) && lowOnMessageListener.call(null, {request, response});
  };


  const metaTabs = [];

  const attachScriptsSequentially = (tabId, sourceScripts, postClientResponse = () => []) => {

    const response = [];

    const scripts = [...sourceScripts];

    const rExecuteScript = () => {

      // All scripts attached
      if (! scripts.length) {
        postClientResponse(response);
        console.log("FINITO", response);
        return;
      }

      const script = scripts.shift();

      const scriptResponse = {};

      response.push(scriptResponse);

      scriptResponse.key = script.key || script.file || script.code;
      scriptResponse.executionTime = Date.now();

      const {file} = script;
      const {code} = script;

      chromium.tabs.executeScript(tabId, {
        file,
        code,
        runAt: "document_end"
      },

      (results) => {
        console.log("il res e'", results);
        scriptResponse.results = results;
          rExecuteScript();
      });
    };

    rExecuteScript();
  };



  if (hasBackgroundPrivilege) {

    chromium.tabs.onRemoved.addListener(
      (tabId, removeInfo) => {
        const index = metaTabs.findIndex(metaTab => metaTab.tab.id === tabId);

        if (index >= 0) {
          console.warn("User has closed the bot tab before it was released programatically", metaTabs[index]);
          metaTabs.splice(index, 1);
          console.log(metaTabs);
        }
    });

    chromium.tabs.onUpdated.addListener(
      (tabId, changeInfo) => {

        const metaTab = metaTabs.find(metaTab => metaTab.id === tabId);

        if (! metaTab) return;

       /*
          bot.scripts = [{code: "10 + 2;"}, ...] // Attach scripts directly
          bot.scriptsOnUpdated = [{code: "Date.now()"}, ...] // Attach scripts each time the tabBot is updated
       */

        metaTab.postMessage({event: changeInfo.status || "stative"}, {changeInfo});

        if (changeInfo.status === "complete" && metaTab.scriptsOnUpdated) {
          attachScriptsSequentially(metaTab.id, metaTab.scriptsOnUpdated, (scriptsResponse) => {
            console.log(new Date(), "onScriptsOnUpdated", metaTab, scriptsResponse, changeInfo);
          });
        }

        else if (changeInfo.status === "loading" && metaTab.scriptsOnUpdating) {
          attachScriptsSequentially(metaTab.id, metaTab.scriptsOnUpdating, (scriptsResponse) => {
            console.log(new Date(), "onScriptsOnUpdating", metaTab, scriptsResponse, changeInfo);
          });
        }
    });



    onMessageFromClient = (message, port) => {

      // .request = what to do, it's same inside and outside
      // ,.stash = params that can be only filled inside of Tabot.js scope

      const {request} = message;
      const {stash} = message;
      const response = {};

      console.log("TABOT: something to accomplish", "request", request, "stash", stash, "from port " + port.name);

      const postClientResponse = (response) => {
        if (metaTab) stash.hashes = metaTab.hashes;
        port.postMessage({request, response, stash});
      };

      let metaTab;

      /*
         1. Get metaTab / create one
         2. Update info
         3. Execute direct scripts
         4. Send Message
      */

      const gotMetaTab = () => {

        if (stash.addHash) {
          metaTab.hashes.push(stash.addHash); // Don't care for duplicates
        }

        if (stash.removeHash) {
          metaTab.hashes = metaTab.hashes.filter(hash => hash !== stash.removeHash); // Don't bother if hash does not exist
        }

        if (request.scriptsOnUpdated) {
          metaTab.scriptsOnUpdated = request.scriptsOnUpdated; // Autoattach scripts (useful if survive === true)
        }

        if (request.scriptsOnUpdating) {
          metaTab.scriptsOnUpdating = request.scriptsOnUpdating; // As above
        }

        return handleMetaTabScripts();

      };

      const handleMetaTabScripts = () => {

        // Execute direct scripts
        if (request.scripts) {

          attachScriptsSequentially(metaTab.id, request.scripts, (scriptsResponse) => {
            response.fromScripts = scriptsResponse;
            sendMetaTabMessage();
          });

          return true; // wait for postClientResponse
        }

        else {
          return sendMetaTabMessage();
        }
      };

      const sendMetaTabMessage = () => {

        if (request.message) {
          chromium.tabs.sendMessage(metaTab.id, request.message, undefined, (tabResponse) => {
            console.log(request, "tabResponse", tabResponse);
            //   response.fromBot = tabResponse;
           // FIXME  postClientResponse(response);
          })

          return true; // wait for postClientResponse
        }

        else {

          const {
            index,
            highlighted,
            active,
            url,
            title,
            favIconUrl,
            status,
            incognito
          } = metaTab.tab;

          Object.assign(response, {
            index,
            highlighted,
            active,
            url,
            title,
            favIconUrl,
            status,
            incognito
          });

          postClientResponse(response);
        }
      };

      // Start analizying the request

      if (request.key) {
        metaTab = metaTabs.find(metaTab => metaTab.key === request.key);

        // If key is not there, it will create a new tab
        if (metaTab) return gotMetaTab();
      }

      else if (request.handle) {
        metaTab = metaTabs.find(metaTab => metaTab.handle === request.handle);

        // Using wrong handle gives an error
        if (! metaTab) {
          response.error = true;
          response.detail = "Invalid handle " + request.handle;
          postClientResponse(response);
          return false; // No need to wait for postClientResponse
        }

        return gotMetaTab();
      }

      // Create a new metaTab
      if (! request.url) {
        response.error = true;
        response.detail = "Failed to create a new Tabot, missing .url";
        postClientResponse(response);
          return false;
      }

      //chromium.tabs.create({index: 1, pinned: true, active: false, url: qarUrl[0]}, function(fetchTab) {
      chromium.tabs.create({index: 10000, pinned: !!request.pinned, active: !!request.active, url: request.url}, (tab) => {
        metaTab = {
          owner: port, // who to respond to
          hashes: [], // used to address specif listeners
          id: tab.id,
          handle: tab.id, // currently just the tab id
          key: request.key,
          survive: false, // should survive after owner dies? (i.e. port is closed)
          tab: tab
        };

        metaTab.postMessage = (response = {}, stash = {}, request = {}) => {

          const {tab} = metaTab;

          Object.assign(response, {
            index: tab.index,
            highlighted: tab.highlighted,
            active: tab.active,
            url: tab.url,
            title: tab.title,
            favIconUrl: tab.favIconUrl,
            status: tab.status,
            incognito: tab.incognito
          });

      // FIXME
          //const request = Object.assign({}, message.request);
         // const response = Object.assign({}, message.response);
         // const stash = Object.assign({}, message.stash);

          stash.hashes = metaTab.hashes;
          metaTab.owner.postMessage({request, response, stash});
        };

        metaTabs.push(metaTab);

        response.handle = metaTab.handle;
        if (request.key) response.key = metaTab.key;

        gotMetaTab();
      });

      return true;  // wait for response()
   };

    let ports = [];

    const onPortDisconnect = (port) => {
      ports = ports.filter(p => p.name !== port.name);
      const letfTabs = metaTabs.filter(m => m.owner.name === port.name);
      if (letfTabs.length) {
        // FIXME removeMetatBass
        chromium.tabs.remove(letfTabs.map(m => m.tab.id),
          () => console.warn(`TABOT: ${letfTabs.length} tab${letfTabs.length > 1 ? "s" : ""}`
                           + " had do be forcely closed due to disconnected port", letfTabs)
        );
      }
      console.log("DISCONECTED PORT: " + port.name);
    };

    const virtualPort = {
      name: "virtual",
      postMessage: (message) => {
        setTimeout(onMessageFromServer.bind(null, message), 0);
      }
    };

    // Background scripts can "send" a message without ports
    postServerRequest = (request = {}, stash = {}) =>
      setTimeout(() => onMessageFromClient({request, stash}, virtualPort), 0);

    chromium.runtime.onConnect.addListener( (port) => {

      if (! /^TABOT[a-z-0-9]+$/.test(port.name) || port.sender.id !== chromium.runtime.id) return;

      port.onDisconnect.addListener(onPortDisconnect);
      port.onMessage.addListener(onMessageFromClient);

      ports.push(port);

      console.log(port.name + " was connected");

    });
  }

  else {

    const PORT_NAME = "TABOT" + randomKey();

    const port = chromium.runtime.connect({name: PORT_NAME});

    port.onMessage.addListener(onMessageFromServer);

    postServerRequest = (request = {}, stash = {}) => port.postMessage({request, stash});
  }

  const _ = new WeakMap();

  class Tabot {
    constructor(url, key, options) {

      // new Tabot("www...", "myKey", {} or new Tabot({url: '...', }

      if ((typeof url === "object") && ("url" in url)) {
        options = url;
        url = {options};
        key = {options};
      }

      const self = this;

      _.set(this, {tab: {}});

      self.listener = Tabot.lowAddListener({url, key}, (message) => {
        console.log("TABOT: class listener", message);
        Object.assign(_.get(self).tab, message);

      });
    }

    get p() {
      return Object.assign({}, _.get(this).tab);
    }

  }


  //postServerRequest({url: "https://www.instagram.com/eccefabius/channel/", scripts:[{code: "alert(243)"}], pinned: true, key: "log"});


  // Expose some low methods
  Object.assign(Tabot, {
    lowPostMessage,
    lowAddListener,
    lowRemoveListener
  });

  // Can't assign setters, they get flattened by .assign
  Object.defineProperty(Tabot, "lowOnMessage", {
    get () {
      return lowOnMessageListener;
    },

    set (listener) {

      if (! listener) {
        lowOnMessageListener = null;
      }

      else if (typeof listener === "function") {
        lowOnMessageListener = listener;
      }

      else {
        throw new Error("lowOnMessage must set a function as listener");
      }
    }
  });

//  var x = new Tabot("https://it.wikipedia.org/wiki/Fonologia");

  return Tabot;

})();
