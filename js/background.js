"use strict";

// ISCLEAR

const TIMEOUT_DEFOLLOW = 45 * 1000; // If you increase this, the site will make you believe you defollowed someone, but you won't

const EXPIRE_SCRAPE = 10 * 60 * 1000; // Ten minutes before scrolling on the Followes / Following activate a new scrape



const WHITE_LIST = ["cher"]; // You don't want to defollow her, don't you?

const queue = new ScrapingQueue();


let global_viewer = {};
function onChangedViewer(viewer) {
  console.log("A new viewer has been set", viewer);
  global_viewer = viewer;
}

// Intercept followers or following users being loaded
chrome.webRequest.onCompleted.addListener(
  (details) => {

    if ( (details.type === "xmlhttprequest")
         && (details.method === "GET")
         && (details.initiator === "https://www.instagram.com")
         && (details.url.startsWith("https://www.instagram.com/graphql/query/"))
       ) {

       const params = (new URL(details.url)).searchParams;

       const hash = params.get("query_hash");

       if (! (hash && /^[a-z0-9]{5,}$/.test(String(hash)))) {
         console.error("Abnormal hash", hash);
         return;
       }

       let variables = params.get("variables");

       try {
         variables = JSON.parse(variables);
       }

       catch (e) {
         console.error("Unable to parse 'variables'", variables, e);
         return;
       }

       const id = variables.id;

       if (id && /^[0-9]{3,}$/.test(String(id))) {
         console.log("SCHED", details);
         queue.scheduleScraping(hash, id);
       }
    }
  },

  {
    urls: ["https://www.instagram.com/graphql/query/*"],
    types: ["xmlhttprequest"]
  },

  ["responseHeaders"]
);

// Show scraping jobs
chrome.browserAction.onClicked.addListener(

  (tab) => {

    const {jobs} = queue;

    if (! jobs.length) {

      alert("There are no scraped users yet."
          + "\nYou may go to your Instagram page and click on 'followers' and 'following'."
          + " A pop up will show the list of users."
          + "\nPlease scroll a little bit down, until you see the badge under the extension icon showing some progress."
          + " At that point, there is no further need to scroll."
          + "\nIsClear will start scraping for you in background. The badge will show OK when it's done.");
      return;
    }

    const ID = jobs[0].id;

    if (jobs.some(job => job.id !== ID)) {

      console.error("Strange: detected scraping was done on different IDs", jobs);

      if (confirm("Inconsistent IDs: it seems you scraped data from different accounts.\nDo you want to clear it and repeat all?")) {
        queue.clear();
        console.log("Data has been cleared out");
      }

      else {
        console.warn("User refused to clear data scraped from mutiple accounts.");
      }
      return;
    }

    const FORMAT = {second: "2-digit", minute: "2-digit", hour: "2-digit", day: "2-digit", month: "short", year: "2-digit"};

    alert(""
      + `Found ${jobs.length} job${jobs.length > 1 ? "s" : ""} for Instagram account #${ID}\n`
      + jobs.map((job, i) => `${i}: [${job.type}] ${(new Date(job.time)).toLocaleDateString("en-US",  FORMAT)} (${job.status})`).join("\n")
    );

    return;

    const followers = items.followers || {users: []};
    const following = items.following || {users: []};
    const lastAnswer = items.lastAnswer || "do nothing";

    // Who's not following back?
    const followersNames = followers.users.map(f => f.username);
    const followingNames = following.users.map(f => f.username);
    const notFollowingBack = followingNames.filter((f) => ! followersNames.includes(f));



    const answer = prompt("Usage\n56f...d9) (hash): start extracting"
                            + "\ndefollow) defollow who's not following back"
                            + "\n\nFOLLOWERS: [" + followers.users.length + "] "
                            + (new Date(followers.date)).toLocaleDateString("it-IT",  FORMAT) + "\n"
                            + "FOLLOWING: [" + following.users.length + "] "
                            + (new Date(following.date)).toLocaleDateString("it-IT",  FORMAT) + "\n"
                            + "\n" + "-".repeat(60) + "\n\n"
                            + "n o t    f o l l o w i n g    b a c k : ____ "
                            + notFollowingBack.length + " ____\n\n"
                            + JSON.stringify(notFollowingBack.slice(0, 30))
                            , lastAnswer
    );

    if (/defollow/i.test(answer)) {
      deFollow(notFollowingBack);
      chrome.storage.local.set({lastAnswer: "defollow"});
    }

    else if (/^\s*[a-f0-9]{10,}\s*$/.test(answer)) {
      const hash = answer.trim().toLowerCase();
      fromHash(hash);
      //  chrome.storage.local.set({lastAnswer: hash});
    }
});

// Communicate with content scripts
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(sender);

    if (request.changedViewer) {
      onChangedViewer(request.changedViewer);
    }

    // from a content script and defollow
    if (sender.tab && request.defollow) {
      // Defollow the users
      deFollow(request.defollow);
    }
    // from a content script and analyze
    else if (sender.tab && request.analyze) {
      // Analyze users
      analyze(request.analyze.slice(0, 9915));
    }
  }
);

// Load the page showing a grid
Tabot.lowAddListener(
  {url: "page/grid.html", pinned: true, key: "grid", message: "maria"},
  (msg) => console.log("I am a listener!", msg)
);








const deFollow = (users) => {
    //  Filter from whitelist (do not unfollow them)
    users = users.filter(function (x) {return WHITE_LIST.indexOf(x) === -1;});

    // Create a new tab
    chrome.tabs.create({index: 0, pinned: true, url: "https://www.instagram.com/"}, (tab) => {

        const loadUser = () => {
            if (! users.length) return;
            const user = users.shift();

            // Load instangram profile https://www.instagram.com/instagram/
            chrome.tabs.update(tab.id, {url: "https://www.instagram.com/" + user + "/"}, (t) => {
                // Load jQuery
                chrome.tabs.executeScript(t.id, {file: "jquery.js", runAt: "document_end"}, () => {
                    // Execute JS
                    chrome.tabs.executeScript(t.id, {file: "defollow.js", runAt: "document_end"}, () => setTimeout(loadUser, TIMEOUT_DEFOLLOW));
                });

            });
        };

        // First call
        loadUser();
    });
};




function analyze (users) {

  // Create a new tab for showing result
  chrome.tabs.create({index: 0, pinned: true, url: chrome.extension.getURL("analyze.html")}, function(showTab) {
    // Create a new tab for evaluating instagram pages
    chrome.tabs.create({index: 1, pinned: true, active: false, url: chrome.extension.getURL("blank.html")}, function(fetchTab) {
      // Current element of the cycle
      var i = 0;
      // Add a listener when url is changed on this tab
      chrome.tabs.onUpdated.addListener(function(tabId , changeInfo) {
        // Once tab url is loaded
        if ((tabId === fetchTab.id) && (changeInfo.status === "complete")) {
          // Load jQuery
          chrome.tabs.executeScript(fetchTab.id, {file: "jquery.js",  runAt: "document_end"}, function () {
            // Execute JS
            chrome.tabs.executeScript(fetchTab.id, {file: "analyze-extract.js", runAt: "document_end"}, function (result) {
              // Show result
              chrome.tabs.sendMessage(showTab.id, {extract: result[0] || {}});
              // Increase index of users array
              i += 1;
              // If there is a new user, update the tab with the new page
              if (i < users.length) {
                chrome.tabs.update(fetchTab.id, {url: "https://www.instagram.com/" + users[i] + "/"});
              }
              // Otherwise, all users fetched and close the tab
              else {
                chrome.tabs.remove(fetchTab.id);
              }
            });
          });
        }
      });
      // Load the first instagram user
      if (users.length) {
        // Update the first tab
        chrome.tabs.update(fetchTab.id, {url: "https://www.instagram.com/" + users[i] + "/"});
      }
    });
  });

/*                    // Create a new tab for evaluating instagram pages
                      chrome.tabs.create({index: 1, pinned: true, url: "https://www.instagram.com/"}, function(tab) {
                        // For each user
                        var impulse = function(user, index, array) {
                          // Load instangram profile https://www.instagram.com/instagram/
                          chrome.tabs.update(tab.id, {url: "https://www.instagram.com/" + user + "/"}, function (t) {
                            // Load jQuery
                            chrome.tabs.executeScript(t.id, {file: "jquery.js",  runAt: "document_end"}, function () {
                              // Execute JS
                              chrome.tabs.executeScript(t.id, {file: "analyze-extract.js", runAt: "document_end"}, function (result) {
                                // Show result
                                chrome.tabs.sendMessage(showTab.id, {extract: result});
                                // If there is a new user, call itself recursively
                                index += 1;
                                if (index < array.length) setTimeout(impulse.bind(null, users[index], index, users), 500);
                              });
                            });
                          });
                        };
                        // First impulse
                        if (users.length) impulse(users[0], 0, users);
                      });
*/

}



Array.prototype.impulse = function (callback, TIMEOUT_DEFOLLOW) {

  // Create a copy of arrat to avoid reference problems
  var _list =  this.slice();
  // Start from zero
  var _current = 0;

  var next = function () {
    // Call the call back (same parameters as  Array.map
    callback(_list[_current], _current, _list);
    // If there is a new element, call next
    _current += 1;
    if (_current < _list.length) setTimeout(next, TIMEOUT_DEFOLLOW);
  };

  // If list has any length, start calling next
  if (_list.length) {
    next();
  }
};

// REGEX

function _bb() {
  if (! arguments.length) return "";
  return "(?:\\b(?:" + Array.prototype.slice.call(arguments).join("") + ")\\b)";
}

function __b() {
  if (! arguments.length) return "";
  return "(?:(?:" + Array.prototype.slice.call(arguments).join("") + ")\\b)";
}

function _bOR() {
  if (! arguments.length) return "";
  return "(?:\\b(?:" + Array.prototype.slice.call(arguments).join("|") + "))";
}

function _CAT() {
  if (! arguments.length) return "";
  return "(?:" + Array.prototype.slice.call(arguments).join("") + ")";
}

function _MAYBE() {
  if (! arguments.length) return "";
  return "(?:" + Array.prototype.slice.call(arguments).map(function (m) {return "(?:" + m + ")?"}).join("") + ")";
}

function _CAPTURE() {
  if (! arguments.length) return "";
  return "(" + Array.prototype.slice.call(arguments).join("") + ")";
}

function _OR() {
  if (! arguments.length) return "";
  return "(?:" + Array.prototype.slice.call(arguments).join("|") + ")";
}

String.prototype.parseParameters = function (option) {
  var res = {};

  var _exec;

  option = option || {};

  if (typeof option.ignoreCase === "undefined") option.ignoreCase = true;
  if (typeof option.autoCommand === "undefined") option.autoCommand = true;

  // " _parameter_name  :|= RexParValue|' Rex Par Value'| "Rex Par Value"
  const REX_PAR_NAME = "\\w+";
  const REX_PAR_EQUAL = "\\s*" + _OR(":", "=") + "\\s*";

  const REX_PAR_NONSPACE_VALUE = "[^\\s]+";


  const REX_PATTERN = _CAPTURE(REX_PAR_NAME)
                      + _MAYBE(REX_PAR_EQUAL
                               + _OR("'(.+?)'", "\"(.+?)\"", _CAPTURE(REX_PAR_NONSPACE_VALUE)) // FIXME CANNOT USE NESTED APOSTROPHE
                        );


  var pattern = new RegExp(REX_PATTERN, "g");

  while (_exec = pattern.exec(this)) {
    var key = _exec[1];
    var value;
    // Standard: all to lower case
    if (option.ignoreCase) key = key.toLowerCase();
    // Value
    var value = _exec[2] || _exec[3] || _exec[4] || true;
    // Parsable value (not "...", '...')
    if (typeof _exec[4] !== "undefined") {
      if (isFinite(value)) {
        value = Number(value);
      }
      else if (/true|false/i.test(value)) {
        value = value.toLowerCase() === "true";
      }
    }
    // Add first true bolean as command
    if (value === true && option.autoCommand && typeof res.command === "undefined") res.command = key;
    res[key] = value;
  }

  return res;
}
