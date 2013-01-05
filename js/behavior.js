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
var first = -1;

function loadPost( name ) {
    if ( downloading ) {
        return;
    }
    console.log( 'Loading post ' + name );
    downloading = true;
    Reddit.downloadPost( name, function( post ) {
        downloading = false;

        items.splice( current + 1, 0, post );
        ++current;
        localRead[ name ] = undefined;
        process( next );
    } );
}

function preloadContent( items ) {
    console.log( 'Preloading content for ' + Object.keys( items ).length + ' items' );

    function preloadItem( i ) {
        if ( i == items.length ) {
            return;
        }

        var url = imageFromItem( items[ i ] );

        if ( url !== false ) {
            console.log( 'Preloading ' + url );
            var img = new Image();    
            img.onload = img.onerror = function() {
                preloadItem( i + 1 );
            };
            img.src = url;
            return;
        }
        preloadItem( i + 1 );
    }

    preloadItem( 0 );
}

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
        var prevlength = items.length;

        // TODO: Optimize O(n^2) algorithm
        feed.data.children = feed.data.children.filter( function( item ) {
            for ( var i = 0; i < items.length; ++i ) {
                var loadedItem = items[ i ];
                
                if ( item.data.id === loadedItem.data.id ) {
                    console.log( 'Skipping already loaded item', item.data.id );
                    return false;
                }
            }
            return true;
        } );
        items.push.apply( items, feed.data.children );
        var newlength = items.length;

        preloadContent( feed.data.children );

        if ( prevlength == newlength ) {
            // we ran out of pages
            console.log( 'End of subreddit.' );
            $( '#img' ).hide();
            $( 'h2' ).html( '<em>This subreddit has no more content.</em>' );
        }
        else {
            callback();
        }
    }, 'json' );
    $( '#img' ).hide();
    $( 'h2' ).html( '<em>Loading content...</em>' );
    $( '#loading' ).fadeIn();
}
function next() {
    if ( downloading ) { 
        return;
    }
    ++current;
    update( next );
}
function prev() {
    --current;
    if ( current < first ) {
        current = first;
    }
    update( prev );
}

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
function imageFromItem( item ) {
    if ( isRead( item.data.name ) ) {
        console.log( 'Skipping read item ' + items[ current ].data.url );
        return false;
    }

    var url = getImage( item.data.url );

    if ( url === false ) {
        console.log( 'Skipping non-image ' + items[ current ].data.url );
        return false;
    }
    return url;
}
function process( direction ) {
    var url = imageFromItem( items[ current ] );
    var args = window.location.href.split( '#' );

    if ( url === false ) {
        return direction();
    }
    items[ current ].data.url = url;
    if ( first == -1 ) {
        first = current;
    }

    if ( args.length > 1 ) {
        args[ 1 ] = items[ current ].data.name;
        window.location.href = args.join( '#' );
    }
    else {
        window.location.href += '#' + items[ current ].data.name;
    }

    $( '#img' ).error( function() {
        direction();
    } );

    return render();
}
function update( direction ) {
    if ( items.length <= current ) {
        var after = '';

        if ( items.length ) {
            after = items[ items.length - 1 ].data.name;
        }
        download( after, 25, function () {
            process( direction );
        } );
    }
    else {
        process( direction );
    }
}

var loadWait = false;

function render() {
    var item = items[ current ].data;
    $( '#img' ).hide();
    $( '#img' )[ 0 ].src = item.url;

    // this intentionally left unescaped; reddit sends this including HTML entities that must be rendered correctly
    // we trust reddit to do the escaping correctly
    $( 'h2' ).html( item.title );
    $( '.reddit' )[ 0 ].href = 'http://reddit.com' + item.permalink;
    loadWait = setTimeout( function() {
        $( '#loading' ).fadeIn();
    }, 500 );
}

function handleImageLoaded() {
    clearTimeout( loadWait );
    $( '#loading' ).hide();
    $( '#img' ).show();
    // $( '#img' )[ 0 ].height = $( window ).height() - $( '#img' )[ 0 ].offsetTop - 20;
    markAsRead( items[ current ].data.name );
}

$( '#img' ).load( handleImageLoaded );

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
