var subreddit = document.body.id.split( '_' )[ 1 ];
var channel = new Reddit.Channel( subreddit );

/*
var preloadQueue = [];

function enqueuePreload( post ) {
    preloadQueue.unshift( post );
}
function preloadPostFromQueue() {
    var post = preloadQueue.shift();
    var url = imageFromPost( post );

    if ( url !== false ) {
        console.log( 'Preloading ' + url );
        var img = new Image();    
        img.onload = img.onerror = function() {
            preloadPostFromQueue();
        };
        img.src = url;
        return;
    }
    preloadPostFromQueue();
}
function preloadContent( post ) {
    console.log( 'Preloading content for post "' + post.title + '"' );
    enqueuePreload( post );
}
*/

// we ran out of pages
function endOfChannel() {
    console.log( 'End of subreddit.' );
    $( '#img' ).hide();
    $( 'h2' ).html( '<em>This subreddit has no more content.</em>' );
}

/*
$( '#img' ).hide();
$( 'h2' ).html( '<em>Loading content...</em>' );
$( '#loading' ).fadeIn();
*/

var lastMotion;
var begun = false;

function stopMotion() {
    next();
    lastMotion = function() {};
}
function next() {
    lastMotion = next;
    if ( begun ) {
        channel.goNext( endOfChannel );
    }
    else {
        begun = true;
    }
    channel.getCurrent( process );
}
function prev() {
    lastMotion = prev;
    channel.goPrevious( stopMotion );
    channel.getCurrent( process );
}
lastMotion = next;

function imageFromPost( post, force ) {
    if ( !force && Storage.isRead( post.name ) ) {
        console.log( 'Skipping read item ' + post.url );
        return false;
    }

    var url = getImage( post.url );

    if ( url === false ) {
        console.log( 'Skipping non-image ' + post.url );
        return false;
    }
    return url;
}
function process( post, force ) {
    if ( typeof force == 'undefined' ) {
        force = false;
    }
    console.log( 'process( ' + post.title + ' )' );
    var url = imageFromPost( post, force );
    var args = window.location.href.split( '#' );

    if ( url === false ) {
        return lastMotion();
    }
    post.url = url;

    if ( args.length > 1 ) {
        args[ 1 ] = post.name;
        window.location.href = args.join( '#' );
    }
    else {
        window.location.href += '#' + post.name;
    }

    $( '#img' ).error( function() {
        lastMotion();
    } );

    return render( post );
}

var loadWait = false;

function render( post ) {
    console.log( 'render( ' + post.title + ' )' );

    var actualURL = getImage( post.url );

    if ( $( '#img' )[ 0 ].src == actualURL ) {
        // nothing to load, we're already there
        return;
    }

    $( '#img' ).hide();

    // this intentionally left unescaped; reddit sends this including HTML entities that must be rendered correctly
    // we trust reddit to do the escaping correctly
    $( 'h2' ).html( post.title );
    $( '.reddit' )[ 0 ].href = 'http://reddit.com' + post.permalink;
    loadWait = setTimeout( function() {
        $( '#loading' ).fadeIn();
    }, 500 );
    $( '#img' )[ 0 ].onload = function() {
        clearTimeout( loadWait );
        $( '#loading' ).hide();
        $( '#img' ).show();
        Storage.markAsRead( post.name );
    };
    $( '#img' )[ 0 ].src = actualURL;
}

Storage.load();

var args = window.location.href.split( '#' );
if ( args.length > 1 ) {
    // link to specific post
    console.log( 'Loading post ' + name );
    Reddit.downloadPost( args[ 1 ], function( post ) {
        process( post, true );
    } );
}
else {
    next();
}
