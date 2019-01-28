"use strict";

const DEBUG = false;

var users = [];

var $body = $("body");

$body.append("<div>Analyze</div");

var $showAll = $("<div> ALL </DIV>");
$showAll.click(function () {
  // Show all
  users.forEach(u => {
    u.$html.toggleClass("filter", false);
  });
});

var $showFacebook = $("<div> ONLY FB </DIV>");
$showFacebook.click(function () {
  // Hide those that are not facebook
  users.forEach(u => {
    u.$html.toggleClass("filter", !u.facebook);
  });
});
$body.append($showAll, $showFacebook);


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(Array.from(arguments));

    // From the extension and analyze
    if (!sender.tab && request.extract) {
      // Get user
      var user = request.extract;
      // Push it on the global array
      users.push(user);
      document.title = users.length + " users found";
      // Build a DOM element
      user.$html = $incapsulateElements("<div class='row flex' />",
        "<img class=icon src='" + user.icon + "' />",
        "<a class=name href='" + user.url + "' target=_blank>@" + user.name + "</a>",
        (user.facebook ? "<a target=_blank href='" + user.facebook + "'><img src=fb-48.png /></a>" : ""),
        "<div class=followers>SEGUITO DA: " + user.followers + "</div>",
        "<div class=following>SEGUE: " + user.following + "</div>",
        (DEBUG ? "<div>" + JSON.stringify(user) +"</div>" : "")
      );
      // Append element to the body
      $("body").append(user.$html);
    }
  }
);


function $incapsulateElements(parentElement) {

  // <parentElement><element1></element1><element2></element2>...</parentElement>
  var $parentElement = $(parentElement);

  $parentElement.append(Array.prototype.slice.call(arguments, 1));
  return $parentElement;
}
