var subreddit = document.body.id.split('_')[1];
var channel = new Reddit.Channel(subreddit);

channel.onnewitemavailable = function(post) {
    console.log('New item available:');
    console.log(post);
    var url = imageFromPost(post)
    if (url !== false && !Storage.isRead(post.name)) {
        Preloader.enqueue(url);
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

function imageFromPost(post) {
    console.log('imageFromPost(' + post.name + ')');
    var url = getImage(post.url);

    if (url === false) {
        console.log('Skipping non-image ' + post.url);
        return false;
    }
    return url;
}
function process(post, force) {
    if (typeof force == 'undefined') {
        force = false;
    }
    console.log('process(' + post.title + ')');
    var url = imageFromPost(post);

    if (!force && Storage.isRead(post.name)) {
        console.log('Skipping read item ' + post.url);
        return lastMotion();
    }

    var args = window.location.href.split('#');

    if (url === false) {
        return lastMotion();
    }
    post.url = url;

    if (args.length > 1) {
        args[1] = post.name;
        window.location.href = args.join('#');
    }
    else {
        window.location.href += '#' + post.name;
    }

    $('#img').error(function() {
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
