var subreddit = document.body.id.replace(/^r_/, '');
var channel = new Reddit.Channel(subreddit);

channel.onnewitemavailable = function(post) {
    console.log('New item available:');
    console.log(post);
    var media = mediaFromPost(post)
    if (media !== false && media.type == 'image' && !Storage.isRead(post.name)) {
        Preloader.enqueue(media.url);
    }
};

// we ran out of pages
function endOfChannel() {
    console.log('End of subreddit.');
    Render.end();
}

/*
$('#img').hide();
$('h2').html('<em>Loading content...</em>');
$('#loading').fadeIn();
*/

var lastMotion;
var begun = false;

function stopMotion() {
    next();
    lastMotion = function() {};
}
function next() {
    lastMotion = next;
    if (begun) {
        channel.goNext(endOfChannel);
    }
    else {
        Dashboard.generate();
        begun = true;
    }
    Render.next();
    channel.getCurrent(process);
}
function prev() {
    lastMotion = prev;
    Render.prev();
    channel.goPrevious(stopMotion);
    channel.getCurrent(process);
}
lastMotion = next;

function mediaFromPost(post) {
    console.log('mediaFromPost(' + post.name + ')');
    var media = getMedia(post);

    if (media === false) {
        console.log('Skipping non-media ' + post.url);
        return false;
    }
    return media;
}
function process(post, force) {
    if (typeof force == 'undefined') {
        force = false;
    }
    console.log('process(' + post.title + ')');
    var media = mediaFromPost(post);

    if (!force && Storage.isRead(post.name)) {
        console.log('Skipping read item ' + post.url);
        return lastMotion();
    }

    var args = window.location.href.split('#');

    if (media === false) {
        return lastMotion();
    }
    post.renderedMedia = media;

    if (args.length > 1) {
        args[1] = post.name;
        window.location.href = args.join('#');
    }
    else {
        window.location.href += '#' + post.name;
    }

    $('.media').off('error').on('error', function() {
        lastMotion();
    });

    return Render.post(post);
}

Storage.load();

var args = window.location.href.split('#');
if (args.length > 1) {
    // link to specific post
    console.log('Loading post ' + name);
    Reddit.downloadPost(args[1], function(post) {
        process(post, true);
        if (!begun) {
            Dashboard.generate();
            begun = true;
        }
    });
}
else {
    next();
}
