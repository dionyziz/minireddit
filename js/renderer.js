var Render = {
    loadWait: false,
    ANIMATION_SPEED: 400,
    ANIMATION_OFFSET: 50,
    lastMotion: 0,
    gone: false,
    post: function(post) {
        Render.gone = false;

        console.log('render(' + post.title + ')');

        var actualURL = getImage(post.url);

        // this intentionally left unescaped; reddit sends this including HTML entities that must be rendered correctly
        // we trust reddit to do the escaping correctly
        $('h2.title').html(post.title);
        $('#reddit')[0].href = 'http://reddit.com' + post.permalink;

        $('#img').hide();
        $('#img').load(function() {
            clearTimeout(Render.loadWait);
            $('#loading').hide();
            $('#img').show();
            var finalLocation = Math.floor($(window).width() / 2 - $('#img').width() / 2);
            $('#img').css({
                opacity: 0,
                left: finalLocation + Render.lastMotion * Render.ANIMATION_OFFSET + 'px'
            })
            .animate({
                opacity: 1,
                left: finalLocation
            }, Render.ANIMATION_SPEED);
            Storage.markAsRead(post.name);
        });

        $('#img').attr('src', actualURL);
    },
    end: function() {
        $('#img').hide();
        $('h2.title').html('<em>This subreddit has no more content.</em>');
    },
    motion: function() {
        Render.gone = true;

        $('h2.title').html('');
        $(window).scrollTop(0);

        $('#oldimg').remove();
        $('<img id="oldimg" />')
        .attr('src', $('#img').attr('src'))
        .css({
            left: $('#img').offset().left + 'px',
            top: $('#img').offset().top + 'px'
        })
        .insertBefore('#img')
        .animate({
            opacity: 0,
            left: $('#img').offset().left - Render.lastMotion * Render.ANIMATION_OFFSET + 'px'
        }, Render.ANIMATION_SPEED, 'swing', function() {
            $('#oldimg').remove();
        });

        $('#img').hide();

        Render.loadWait = setTimeout(function() {
            $('#loading').fadeIn();
        }, 500);
    },
    next: function() {
        if (Render.gone) {
            return;
        }
        Render.lastMotion = 1;
        Render.motion();
    },
    prev: function() {
        if (Render.gone) {
            return;
        }
        Render.lastMotion = -1;
        Render.motion();
    }
};
