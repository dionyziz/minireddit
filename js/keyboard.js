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
