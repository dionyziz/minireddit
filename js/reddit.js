var Reddit = {
    downloadPost: function(name, callback) {
        // post factory, download from reddit
        console.log('Loading post ' + name);
        $.get('post.php', {
            name: name
        }, function(postList) {
            var post = postList.data.children[0].data;

            callback(new Reddit.Post(post));
        }, 'json');
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
        this.currentID = 0;
        this.limit = 25;

        this.onnewitemavailable = function() {};
        this.onerror = function() {};
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
        }, this.onerror);
    },
    downloadNextPage: function(ondone, onerror) {
        var after;
        var self = this;

        if (this.items.length == 0) {
            after = '';
        }
        else {
            after = this.items[this.items.length - 1].name;
        }
        $.get('feed.php', {
            r: this.subreddits.join('+'),
            after: after,
            limit: this.limit
        }, function(feed) {
            var prevlength = self.items.length;

            if (feed == null) {
                Render.invalid();
                return;
            }
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
                // we ran out of pages
                console.log('End of subreddit.');
                self.onerror();
            }
            else {
                ondone();
            }
        }, 'json');
    },
    goNext: function(onerror) {
        if (typeof onerror == 'function') {
            this.onerror = onerror;
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
