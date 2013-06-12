$('#settings').click(function(e) {
    $(document).scrollTop(0);
    
    setTimeout(function() {
        $('.dashboard').show().css({
            opacity: 1
        });
        $('.content').css({
            overflow: 'hidden',
            width: $(window).width() + 'px',
            height: $(window).height() + 'px',
        });

        var c_prime_offset;
        if ($('#dashboard_thumb_' + subreddit + ' div.wrapper div').length) {
            c_prime_offset = $('#dashboard_thumb_' + subreddit + ' div.wrapper div').offset();
        }
        else {
            c_prime_offset = {
                left: 0,
                top: 0
            };
        }
        var c = new Vector($('#img').offset().left - $(document).scrollLeft() + $('#img').width() / 2,
                           $('#img').offset().top - $(document).scrollTop() + $('#img').height() / 2);
        var c_prime = new Vector(c_prime_offset.left + Dashboard.W / 2, c_prime_offset.top + Dashboard.H / 2);
        var lambda;

        if ($('#img').width() < $('#img').height()) {
            lambda = Dashboard.W / $('#img').width();
        }
        else {
            lambda = Dashboard.H / $('#img').height();
        }

        var t = c_prime.minus(c.scale(lambda));
        var f = t.scale(1 / (1 - lambda));
        var cssOrigin = Math.floor(f.x) + 'px ' + Math.floor(f.y) + 'px';

        $('.content').css({
            height: $(window).height() + 'px',
            opacity: 0,
            position: 'absolute',
            minHeight: '100%',
            minWidth: '100%',
            webkitTransformOrigin: cssOrigin,
            mozTransformOrigin: cssOrigin,
            transformOrigin: cssOrigin,
            webkitTransform: 'scale(' + lambda + ')',
            mozTransform: 'scale(' + lambda + ')',
            transform: 'scale(' + lambda + ')',
            pointerEvents: 'none',
            backgroundColor: 'rgba(235, 235, 235, 0)'
        });
        $('.info').css({
            opacity: 0
        });
        $('h2.title').css({
            opacity: 0
        });
        Dashboard.align();
        e.stopPropagation();
    }, 20);

    return false;
});

$('#img').click(next);

if (localStorage.instructions == 'read') {
    $('.instructions').hide();
}
$('.instructions').click(function() {
    $(this).fadeOut();
    localStorage.instructions = 'read';
});
