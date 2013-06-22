var Dashboard = {
    W: 150,
    H: 150,
    align: function() {
        $('.dashboard ol img').each(function() {
            var $this = $(this);
            var onload = function() {
                $this.css({
                    width: 'auto',
                    height: 'auto'
                });
                if ($this.width() < $this.height()) {
                    $this.css({
                        width: Dashboard.W + 'px',
                        height: $this.height() / ($this.width() / Dashboard.W) + 'px'
                    });
                }
                else {
                    $this.css({
                        width: $this.width() / ($this.height() / Dashboard.H) + 'px',
                        height: Dashboard.H + 'px'
                    });
                }
                $this.css({
                    left: Math.floor(Dashboard.W / 2 - $this.width() / 2) + 'px',
                    top: Math.floor(Dashboard.H / 2 - $this.height() / 2) + 'px'
                });
            };
            $this.load(onload);
            onload();
        });
    },
    generate: function() {
        // give us a couple of seconds' worth of bandwidth to preload content
        setTimeout(function() {
            var subreddits = ['funny', 'pics', 'aww', 'wtf', 'AdviceAnimals', 'fffffffuuuuuuuuuuuu', 'gifs'];

            for (var i = 0; i < subreddits.length; ++i) {
                var subreddit = subreddits[i];

                Dashboard.generateSubreddit(subreddit);
            }
        }, 4000);
    },
    generateSubreddit: function(subreddit) {
        var channel = new Reddit.Channel(subreddit);
        channel.limit = 5;

        Dashboard.generateSubredditThumb(subreddit);
        Dashboard.generateSubredditContent(subreddit, channel);
    },
    generateSubredditContent: function(subreddit, channel) {
        channel.getCurrent(function(post) {
            console.log('Generate subreddit content');

            var url = imageFromPost(post);
            
            if (url === false || Storage.isRead(post.name)) {
                channel.goNext();
                Dashboard.generateSubredditContent(subreddit, channel);
                return;
            }
            Dashboard.replaceSubredditThumb(subreddit, url);
        });
    },
    replaceSubredditThumb: function(subreddit, thumbnail) {
        $('#dashboard_thumb_' + subreddit + ' img').attr('src', thumbnail);
    },
    generateSubredditThumb: function(subreddit) {
        var $li = $("<li id='dashboard_thumb_" + subreddit + "'>"
                     + "<a href='/" + subreddit + "'>"
                     + "<h2>" + subreddit + "</h2>"
                        + "<div class='wrapper'>"
                            + "<div>"
                                + "<img src='' alt='" + subreddit + "' />"
                            + "</div>"
                        + "</div>"
                    + "</a>"
                + "</li>");
        $('.dashboard ol').append($li);
    }
};
Dashboard.align();
