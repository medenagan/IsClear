class ScrapingQueue {

  static get TIMEOUT_SCRAPE () {
    return 25;
  }

  constructor() {

    this.status = "idle";
    this.badgeText = "";
    //this.jobs = JSON.parse('[{"hash":"56066f031e6239f35a904ac20c9f37d9", "type": "scraping","id":"297582171","status":"error","time":1541564681544,"data":{},"_after":"QVFBOGxRU3FhQ0VvZ1ZJTU9vLXlkTjA1bS04ZHBJQUJoUjJwTGtFTUtXeTRnd2tKTDdnYTNZUEhMb3Z3dGlYQ28zLVNxeVdmWjlrWTlEVU90RXh2eUxQVw=="},{"hash":"c56ee0ae1f89cdbd1c89e2bc6b8f3d18","id":"297582171","status":"done","time":1541564720719,"data":{},"_after":"QVFEZE1pc1VOSGZucWx2ZGNGZndKbGpPeG9URTFXRjRGeTlIWHVFQVF1V3Mta0FubkJqMi1NemRXczFGRnI0RzItZVcyV295ZEhGN1ZvOEw1UzdrRGJCTA=="}]');
    this.jobs = [];
    this._update();

  }

  get length() {
    return this.queue.length;
  }

  clear() {
    this.jobs.length = 0;
    this._update();
  }

  scheduleScraping(hash, id) {
    const {jobs} = this;

    if (jobs.some(job => (job.status !== "error") && (job.hash === hash) && (job.id === id))) {
      console.warn("Scheduling aborted, already queued", hash, id);
    }

    else {
      jobs.push({hash, id, type: "scraping", status: "pending", time: Date.now()})
      console.log("Scheduling", hash, id, jobs);
      this._update();
    }
  }

  // On update of any object
  _update() {

    const {jobs} = this;

    const nextJob = jobs.find(job => /pending|partial/.test(job.status));

    let text = "";

    if (jobs.length) {

      if (nextJob) {
        text = jobs.length;

        if (jobs.some(job => job.status === "error")) text += "E";

        const asciiBar = ["◐", "◓", "◑", "◒"];
        text += asciiBar[(1 + asciiBar.indexOf(this.badgeText.substr(-1))) % asciiBar.length];
      }

      else {
        text = "OK";
      }
    };

    // Max 4 chars
    chrome.browserAction.setBadgeText({text});
    this.badgeText = text;

    // Don't allow parallel scraping
    if (jobs.some(job => job.status === "working")) {
      console.warn("Serving aborted, parallel scraping was disabled. You may consume your quota without completing a job.");
      return;
    }

    if (nextJob) {
      setTimeout(() => this._scrape(nextJob), ScrapingQueue.TIMEOUT_SCRAPE);
    }

    else {
      console.log("Done");
    }
  }

  _scrape(job) {

    job.status = "working";

    const {hash, id, _after} = job;

    const variables = {
      id: String(id),
      include_reel: false,
      fetch_mutual: false,
      first: 200 // the server will decide the actual maximum, about 50 probably
    };

    if (_after) variables.after = _after;

    const insta_roles = {
      "following": "edge_follow",
      "followers": "edge_followed_by"
    };

    const dest = job.data || (job.data = {});

    $.ajax("https://www.instagram.com/graphql/query/", {

      data: {
        query_hash: hash,
        variables: JSON.stringify(variables)
      },

      error: (e) => {
        job.status = "error";
        console.error("Ajax error", e, job);
        this._update();
      },

      success: (result) => {
        result = (result.data || {}).user || {};

        // [following, followers].forEach(...
        let roleHandled;
        Object.keys(insta_roles).forEach(role => {

          if (! (insta_roles[role] in result)) return;

          roleHandled = true;

          let by = result[insta_roles[role]];
          dest[role] = dest[role] || {date: Date.now(), users: []};

          if (by.edges && by.edges instanceof Array) {
            dest[role].users = [
              ...dest[role].users,
              ...by.edges.map(u => ({
                username: u.node.username,
                icon: u.node.profile_pic_url,
                doIfollow: u.node.followed_by_viewer, // Are we following?
              }))
            ];
          }

          console.log("dest", dest);
          if (by.page_info.has_next_page) {
            job.status = "partial";
            job._after = by.page_info.end_cursor;
            this._update();
          }

          else {
            console.log("End page", by);
            job.status = "done";
            this._update();
          }
        });

        if (! roleHandled) {
          console.warn("Unusual ajax result, expecting a role", result);
          job.status = "done";
          this._update();  
        }
	    }
    });
  }
}
