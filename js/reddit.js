var Reddit = {
    MAX_RETRIES: 2,
    RETRY_DELAY: 500,
    downloadPost: function(name, callback, onerror) {
        // post factory, download from reddit
        console.log('Loading post ' + name);
        $.ajax({
            url: 'post.php',
            data: {
                name: name
            },
            dataType: 'json',
            timeout: 15000
        }).done(function(postList) {
            if (!postList || !postList.data || !$.isArray(postList.data.children) || postList.data.children.length == 0) {
                if (typeof onerror == 'function') {
                    onerror();
                }
                return;
            }
            var post = postList.data.children[0].data;

            callback(new Reddit.Post(post));
        }).fail(function() {
            if (typeof onerror == 'function') {
                onerror();
            }
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
        this.itemsDict = {};
        this.after = '';
        this.currentID = 0;
        this.limit = 25;

        this.onnewitemavailable = function() {};
        this.onend = function() {};
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
            if (self.items.length > self.currentID) {
                callback(self.items[self.currentID]);
            }
            else {
                self.onend();
            }
        }, this.onend, this.onerror);
    },
    downloadNextPage: function(ondone, onend, onerror, retries) {
        if (this.after === null) {
            if (typeof onend == 'function') {
                onend();
            }
            return;
        }

        var self = this;
        var after = this.after;

        if (typeof retries == 'undefined') {
            retries = Reddit.MAX_RETRIES;
        }

        function retryOrError() {
            if (retries > 0) {
                console.log('Could not load subreddit page. Retrying.');
                setTimeout(function() {
                    self.downloadNextPage(ondone, onend, onerror, retries - 1);
                }, Reddit.RETRY_DELAY);
                return;
            }
            if (typeof onerror == 'function') {
                onerror();
            }
        }

        $.ajax({
            url: 'feed.php',
            data: {
                r: this.subreddits.join('+'),
                after: after,
                limit: this.limit
            },
            dataType: 'json',
            timeout: 15000
        }).done(function(feed) {
            var prevlength = self.items.length;

            if (feed && feed.error == 'not_found') {
                Render.invalid();
                return;
            }
            if (!feed || !feed.data || !$.isArray(feed.data.children)) {
                retryOrError();
                return;
            }
            self.after = feed.data.after === null ? null : (feed.data.after || '');

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
                if (self.after && self.after != after) {
                    self.downloadNextPage(ondone, onend, onerror, retries);
                    return;
                }
                // we ran out of pages
                console.log('End of subreddit.');
                if (typeof onend == 'function') {
                    onend();
                }
            }
            else {
                ondone();
            }
        }).fail(function(xhr) {
            if (xhr.status == 404) {
                Render.invalid();
                return;
            }
            retryOrError();
        });
    },
    goNext: function(onend, onerror) {
        if (typeof onend == 'function') {
            this.onend = onend;
        }
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
