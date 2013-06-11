var loadWait = false;

function render(post) {
    console.log('render(' + post.title + ')');

    var actualURL = getImage(post.url);

    if ($('#img')[0].src == actualURL) {
        // nothing to load, we're already there
        return;
    }

    $('<img id="oldimg" />').attr('src', $('#img').src).insertBefore('#img');

    $('#img').hide();

    // this intentionally left unescaped; reddit sends this including HTML entities that must be rendered correctly
    // we trust reddit to do the escaping correctly
    $('h2').html(post.title);
    $('.reddit')[0].href = 'http://reddit.com' + post.permalink;
    loadWait = setTimeout(function() {
        $('#loading').fadeIn();
    }, 500);
    $('#img')[0].onload = function() {
        clearTimeout(loadWait);
        $('#loading').hide();
        $('#img').show();
        Storage.markAsRead(post.name);
    };
    $('#img')[0].src = actualURL;
}

function renderEnd() {
    $('#img').hide();
    $('h2').html('<em>This subreddit has no more content.</em>');
}
