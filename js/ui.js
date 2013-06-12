$('#settings').click(function(e) {
    $('.dashboard').show().css({
        opacity: 1
    });

    var origin = $('#dashboard_thumb_' + subreddit).offset();

    console.log('origin:');
    console.log(origin.left, origin.top);

    $('.content').css({
        height: $(window).height() + 'px',
        opacity: 0,
        position: 'absolute',
        minHeight: '100%',
        webkitTransformOrigin: (origin.left + Dashboard.W / 2) + 'px ' + (origin.top + Dashboard.H / 2) + 'px',
        webkitTransform: 'scale(0.2)'
    });
    Dashboard.align();
    e.stopPropagation();
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
