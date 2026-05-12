var Reddit = {
    downloadPost: function(name, callback) {
        // post factory, download from reddit
        console.log('Loading post ' + name);
        $.get('post.php', {
            name: name
        }, function(postList) {
            if (postList == null || postList.error) {
                Render.networkError();
                return;
            }
            var post = postList.data.children[0].data;

            callback(new Reddit.Post(post));
        }, 'json').fail(function() {
            Render.networkError();
        });
    },
    Post: function(data) {
        this.name = data.name;
        this.title = data.title;
        this.url = data.url;
        this.permalink = data.permalink;
    },
    Channel: function(subreddits) {
        if (typeof subreddits == 'string') {
            subreddits = [subreddits];
        }
        this.subreddits = subreddits;
        this.items = [];
        this.after = '';
        this.currentID = 0;
        this.limit = 25;
        this.retryLimit = 2;

        this.onnewitemavailable = function() {};
        this.onerror = function() {};
        this.onend = function() {};
    },
};

Reddit.Channel.prototype = {
    constructor: Reddit.Channel,
    items: [],
    itemsDict: {},
    getCurrent: function(callback) {
        var self = this;

        if (this.items.length > this.currentID) {
            // current item is already downloaded, return immediately
            return callback(this.items[this.currentID]);
        }
        // we don't yet have the current item; download it
        this.downloadNextPage(function() {
            callback(self.items[self.currentID]);
        }, this.onend, this.onerror);
    },
    downloadNextPage: function(ondone, onend, onerror, retries) {
        var self = this;
        retries = retries || 0;
        var requestedAfter = this.after;

        var request = $.get('feed.php', {
            r: this.subreddits.join('+'),
            after: this.after,
            limit: this.limit
        }, function(feed) {
            var prevlength = self.items.length;

            if (feed == null || feed.error || !feed.data || !feed.data.children) {
                Render.invalid();
                return;
            }
            self.after = feed.data.after || '';
            feed.data.children = feed.data.children.map(function(item) {
                return new Reddit.Post(item.data);
            }).filter(function(item) {
                // Make sure we only inject new content by looking at what
                // has been shown already.
                // This is important, as pages in reddit may have changed
                // during ranking.
                if (typeof self.itemsDict[item.name] !== 'undefined') {
                    console.log('Skipping already loaded item', item.name);
                    return false;
                }
                return true;
            });
            self.items.push.apply(self.items, feed.data.children);

            var newlength = self.items.length;

            for (var i = 0; i < feed.data.children.length; ++i) {
                var item = feed.data.children[i];
                self.onnewitemavailable(item);
                self.itemsDict[item.name] = true;
            }

            if (prevlength == newlength) {
                if (self.after != '' && self.after != requestedAfter) {
                    self.downloadNextPage(ondone, onend, onerror, retries);
                    return;
                }
                console.log('End of subreddit.');
                onend();
            }
            else {
                ondone();
            }
        }, 'json');

        request.fail(function() {
            if (retries < self.retryLimit) {
                console.log('Retrying subreddit feed after transient failure.');
                self.downloadNextPage(ondone, onend, onerror, retries + 1);
                return;
            }
            console.log('Could not load subreddit feed.');
            onerror();
        });
    },
    goNext: function(onerror) {
        if (typeof onerror == 'function') {
            this.onend = onerror;
        }

        ++this.currentID;
    },
    goPrevious: function(onerror) {
        if (this.currentID - 1 < 0) {
            if (typeof onerror == 'function') {
                return onerror();
            }
            return;
        }
        --this.currentID;
    }
};
