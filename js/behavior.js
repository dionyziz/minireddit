document.getElementById( 'settings' ).onclick = function( e ) {
    $( '.bubble' ).toggle();
    e.stopPropagation();
    return false;
};
document.onclick = function() {
    $( '.bubble' ).hide();
};
$( '.bubble' ).click( function( e ) {
    e.stopPropagation();
} );

var subreddit = document.body.id.split( '_' )[ 1 ];
var channel = new Reddit.Channel( subreddit );

function loadPost( name ) {
    console.log( 'Loading post ' + name );
    Reddit.downloadPost( name, function( post ) {
        process( post, true );
    } );
}

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

String.prototype.beginsWith = function( str ) {
    return this.substr( 0, str.length ) == str;
};

function getImage( url ) {
    switch ( url.substr( -4 ).toLowerCase() ) {
        case '.gif':
        case '.jpg':
        case '.png':
            return url;
    }
    if ( url.beginsWith( 'http://imgur.com' )
      || url.beginsWith( 'http://quickmeme.com' )
      || url.beginsWith( 'http://qkme.me' ) ) {
        console.log( 'Converted to image: ' + url );
        return 'imgur.php?url=' + encodeURIComponent( url ) + '&type=.jpg';
    }
    return false;
}
function imageFromPost( post, force ) {
    if ( !force && isRead( post.name ) ) {
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
        markAsRead( post.name );
    };
    $( '#img' )[ 0 ].src = actualURL;
}

loadStorage();

var args = window.location.href.split( '#' );
if ( args.length > 1 ) {
    loadPost( args[ 1 ] );
}
else {
    next();
}

$( window ).keydown( function( e ) {
    switch ( e.keyCode ) {
        case 74: // j
            $( '.instructions' ).fadeOut();
            localStorage.instructions = 'read';
            next();
            break;
        case 75: // k
            prev();
            break;
    }
} );
$( '#img' ).click( next );

if ( localStorage.instructions == 'read' ) {
    $( '.instructions' ).hide();
}

$( '.instructions' ).click( function() {
    $( this ).fadeOut();
    localStorage.instructions = 'read';
} );

var read, localRead;

function isRead( name ) {
    // console.log( 'Checking if "' + name + '" is read' );
    // console.log( read );
    return typeof localRead[ name ] !== 'undefined';
}
function markAsRead( name ) {
    console.log( 'Marking ' + name + ' as read.' );
    read[ name ] = true;
    saveStorage();
}
function markAsReadImmediate( name ) {
    markAsRead( name );
    localRead[ name ] = true;
}
function saveStorage() {
    if ( typeof( localStorage ) !== 'undefined' ) {
        // console.log( 'Saving to storage.' );
        localStorage.read = JSON.stringify( read );
    }
}
function loadStorage() {
    if ( typeof( localStorage ) !== 'undefined' ) {
        console.log( 'Local storage is supported' );
    }
    else {
        console.log( 'Local storage is not supported' );
        return;
    }

    if ( typeof localStorage.read === 'undefined' ) {
        console.log( 'Storage is empty.' );
        localStorage.read = '{}';
    }
    else {
        console.log( 'Loading from storage: ' );
    }
    read = JSON.parse( localStorage.read );
    localRead = JSON.parse( localStorage.read );
    console.log( 'Loaded ' + Object.keys( read ).length + ' read items from storage' );
}
