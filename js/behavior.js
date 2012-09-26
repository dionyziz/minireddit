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

var items = [], current = -1, downloading = false;
var subreddit = document.body.id.split( '_' )[ 1 ];

function download( after, limit, callback ) {
    if ( downloading ) {
        return;
    }
    console.log( 'Loading new page after ' + after );
    downloading = true;
    $.get( 'feed.php', {
        r: subreddit,
        after: after,
        limit: limit
    }, function( feed ) {
        downloading = false;
        items.push.apply( items, feed.data.children );
        callback();
    }, 'json' );
}
function next() {
    if ( downloading ) { 
        return;
    }
    ++current;
    update( next, true );
}
function prev() {
    --current;
    if ( current < 0 ) {
        current = 0;
    }
    update( prev, false );
}
function getImage( url ) {
    switch ( url.substr( -4 ).toLowerCase() ) {
        case '.gif':
        case '.jpg':
        case '.png':
            return url;
    }
    if ( url.substr( 0, 'http://imgur.com'.length ) == 'http://imgur.com' ) {
        console.log( 'Converted to image: ' + url );
        return 'imgur.php?url=' + encodeURIComponent( url ) + '&type=.jpg';
    }
    return false;
}
function process( direction, skipRead ) {
    var url = getImage( items[ current ].data.url );

    if ( url === false ) {
        console.log( 'Skipping non-image ' + items[ current ].data.url );
        return direction();
    }
    else {
        items[ current ].data.url = url;
    }
    if ( skipRead && isRead( items[ current ].data.name ) ) {
        console.log( 'Skipping read item ' + items[ current ].data.url );
        return direction();
    }
    return render();
}
function update( direction, skipRead ) {
    if ( items.length <= current ) {
        var after = '';

        if ( items.length ) {
            after = items[ items.length - 1 ].data.name;
        }
        download( after, 25, function () {
            process( direction, skipRead );
        } );
    }
    else {
        process( direction, skipRead );
    }
}

var loadWait = false;

function render() {
    var item = items[ current ].data;
    $( '#img' ).hide();
    $( '#img' )[ 0 ].src = item.url;
    $( 'h2' ).text( item.title );
    $( '.reddit' )[ 0 ].href = 'http://reddit.com' + item.permalink;
    loadWait = setTimeout( function() {
        $( '#loading' ).fadeIn();
    }, 500 );
}

$( '#img' ).load( function() {
    clearTimeout( loadWait );
    $( '#loading' ).hide();
    $( '#img' ).show();
    markAsRead( items[ current ].data.name );
} );

loadStorage();
next();

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
    // console.log( 'Marking ' + name + ' as read.' );
    read[ name ] = true;
    saveStorage();
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
    console.log( read );
}
