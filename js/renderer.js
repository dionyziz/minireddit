var Render = {
    loadWaitTimeout: false,
    progressBarTimeout: false,
    startLoadingTime: -1,
    loadTotalImageSize: -1,
    ANIMATION_SPEED: 400,
    ANIMATION_OFFSET: 50,
    ANIMATION_PERSPECTIVE: 1200,
    lastMotion: 0,
    gone: false,
    currentURL: false,
    currentMediaSelector: '#img',
    post: function(post) {
        Render.gone = false;

        console.log('render(' + post.title + ')');

        var media = post.renderedMedia || getMedia(post);
        if (media === false) {
            return;
        }
        var actualURL = media.url;
        var $media = media.type == 'video' ? $('#video') : $('#img');
        var $other = media.type == 'video' ? $('#img') : $('#video');
        var domMedia = $media[0];
        var onMediaLoad = function() {
            var finalLocation = Math.floor($(window).width() / 2 - $media.width() / 2);

            Render.stopLoading(true);
            $media.show().css({
                left: finalLocation + 'px',
            });
            if (Render.lastMotion == -1) {
                Render.moveIn($media.css({zIndex: 100}).addClass('pageflip'));
            }
            else {
                $media.removeClass('pageflip').css({
                    zIndex: 1,
                    opacity: 1,
                    webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(0deg)'
                });
            }
            Storage.markAsRead(post);
        };

        // this intentionally left unescaped; reddit sends this including HTML entities that must be rendered correctly
        // we trust reddit to do the escaping correctly
        $('h2.title').html(post.title);
        $('#reddit')[0].href = 'http://reddit.com' + post.permalink;

        Render.currentURL = actualURL;
        Render.currentMediaSelector = media.type == 'video' ? '#video' : '#img';

        $other.hide().removeClass('current pageflip').attr('src', '');
        if ($other[0].pause) {
            $other[0].pause();
        }

        $media.addClass('current').css({
            opacity: 0,
            webkitTransform: 'perspective(' + Render.ANIMATION_PERSPECTIVE + 'px) rotateY(-60deg)',
        }).hide();

        Render.startLoadingTime = (new Date()) | 0;
        if (media.type == 'video') {
            domMedia.onloadeddata = onMediaLoad;
            domMedia.src = actualURL;
            domMedia.load();
            if (domMedia.play) {
                var playResult = domMedia.play();
                if (playResult && playResult.catch) {
                    playResult.catch(function() {});
                }
            }
        }
        else {
            domMedia.onload = onMediaLoad;
            $media.attr('src', actualURL);
        }
    },
    end: function() {
        $('.media').hide();
        $('h2.title').html('<em>This subreddit has no more content.</em>');
        Render.stopLoading();
    },
    invalid: function() {
        $('.media').hide();
        $('h2.title').html('<em>This subreddit does not exist.</em>');
        Render.stopLoading();
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

        $('.oldmedia').remove();
        var $current = $(Render.currentMediaSelector);
        var $oldmedia;
        if ($current[0].tagName.toLowerCase() == 'video') {
            $oldmedia = $('<video muted loop autoplay playsinline />').attr('src', $current.attr('src'));
        }
        else {
            $oldmedia = $('<img />').attr('src', $current.attr('src'));
        }
        $oldmedia
        .addClass('oldmedia pageflip')
        .insertBefore($current)
        .css({
            left: Math.floor($(window).width() / 2 - $current.width() / 2) + 'px'
        });
        if (Render.lastMotion == 1) {
            Render.moveOut($oldmedia.css({zIndex: 100}));
        }
        else {
            $oldmedia.css({zIndex: 1}).css({opacity: 0});
        }

        $('.media').hide();

        Render.startLoading();
    },
    startLoading: function() {
        var almostDone = false;

        function loadProgress(progress) {
            if (progress > 0.99) {
                if (!almostDone) {
                    console.log('Almost done!');
                    almostDone = true;
                    $('#loading .progress').fadeOut();
                }
            }
            else if (progress > 0) {
                $('#loading .progress').fadeIn();
                $('#loading .progressbar')[0].style.width = Math.floor(100 * progress) + '%';
                $('#bounce').hide();
                almostDone = false;
            }
            else {
                $('#loading .progress').hide();
                $('#loading .progressbar')[0].style.width = 0;
                $('#bounce').show();
                almostDone = false;
            }
        }
        function humanSize(bytes) {
            if (bytes > 1024) {
                bytes /= 1024;
                bytes = Math.floor(10 * bytes) / 10;
                if (bytes > 1024) {
                    bytes /= 1024;
                    bytes = Math.floor(10 * bytes) / 10;
                    return bytes + ' MB';
                }
                return bytes + ' KB';
            }
            return bytes + ' B';
        }
        function updateProgress() {
            if (Render.loadTotalImageSize <= 10) {
                $('#loading .text').text('');
                $('#bounce').show();
                $('#loading .progress').hide();
                return;
            }
            var dt = (new Date() | 0) - Render.startLoadingTime;
            console.log('Time elapsed (ms): ' + dt);
            var sizeDownloaded = dt * Preloader.speedEstimate;
            console.log('Speed estimate: ' + Preloader.speedEstimate);
            console.log('Bytes downloaded: ' + sizeDownloaded);
            console.log('Bytes total: ' + Render.loadTotalImageSize)

            if (sizeDownloaded < 0) {
                sizeDownloaded = 0;
            }
            if (sizeDownloaded > Render.loadTotalImageSize) {
                sizeDownloaded = Render.loadTotalImageSize;
            }
            if (sizeDownloaded > 0 && humanSize(sizeDownloaded) != humanSize(Render.loadTotalImageSize)) {
                $('#loading .text').text(humanSize(sizeDownloaded) + ' / ' + humanSize(Render.loadTotalImageSize));
            }
            else {
                $('#loading .text').text(humanSize(Render.loadTotalImageSize));
            }
            loadProgress(sizeDownloaded / Render.loadTotalImageSize);
            clearTimeout(Render.progressBarTimeout);
            Render.progressBarTimeout = setTimeout(updateProgress, 100);
        }
        clearTimeout(Render.loadWaitTimeout);
        Render.loadWaitTimeout = setTimeout(function() {
            $.get('size.php', {
                url: Render.currentURL
            }, function(size) {
                Render.loadTotalImageSize = size;
                updateProgress();
            });
            $('#loading .progress')[0].style.webkitTransition = '';
            loadProgress(0);
            $('#loading .progress')[0].style.webkitTransition = 'width 0.3s';
            $('#loading .text').text('');
            $('#loading').fadeIn();
        }, 500);
    },
    stopLoading: function(done) {
        if (done) {
            if (Render.loadTotalImageSize > 10) {
                var dt = (new Date() | 0) - Render.startLoadingTime;

                Preloader.updateEstimate(Render.loadTotalImageSize, dt);
            }
        }
        clearTimeout(Render.progressBarTimeout);
        clearTimeout(Render.loadWaitTimeout);
        $('#loading').hide();
    },
    next: function() {
        if (Render.gone) {
            return;
        }
        Render.stopLoading();
        Render.lastMotion = 1;
        Render.motion();
    },
    prev: function() {
        if (Render.gone) {
            return;
        }
        Render.stopLoading();
        Render.lastMotion = -1;
        Render.motion();
    }
};
