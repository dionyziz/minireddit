var Render = {
    loadWait: false,
    ANIMATION_SPEED: 400,
    ANIMATION_OFFSET: 50,
    ANIMATION_PERSPECTIVE: 1200,
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

        $('#img').css({
            opacity: 0,
            webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(-60deg)',
        }).hide();
        $('#img')[0].onload = function() {
            var finalLocation = Math.floor($(window).width() / 2 - $('#img').width() / 2);

            clearTimeout(Render.loadWait);
            $('#loading').hide();
            $('#img').show().css({
                left: finalLocation + 'px',
            });
            if (Render.lastMotion == -1) {
                Render.moveIn($('#img').css({zIndex: 100}).addClass('pageflip'));
            }
            else {
                $('#img').removeClass('pageflip').css({
                    zIndex: 1,
                    opacity: 1,
                    webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(0deg)'
                });
            }
            Storage.markAsRead(post);
        };

        $('#img').attr('src', actualURL);
    },
    end: function() {
        $('#img').hide();
        $('h2.title').html('<em>This subreddit has no more content.</em>');
    },
    moveOut: function($img) {
        $img.css({
            webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(-60deg)',
            opacity: 0
        });
    },
    moveIn: function($img) {
        $img
        .css({
            webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(0deg)',
            opacity: 1
        });
    },
    motion: function() {
        Render.gone = true;

        $('h2.title').html('');
        $(window).scrollTop(0);

        $('#oldimg').remove();
        $oldimg = $('<img id="oldimg" />')
        .addClass('pageflip')
        .attr('src', $('#img').attr('src'))
        .insertBefore('#img')
        .css({
            left: Math.floor($(window).width() / 2 - $('#img').width() / 2) + 'px'
        });
        if (Render.lastMotion == 1) {
            Render.moveOut($oldimg.css({zIndex: 100}));
        }
        else {
            $oldimg.css({zIndex: 1}).css({opacity: 0});
        }

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
