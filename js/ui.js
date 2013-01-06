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

$( '#img' ).click( next );

if ( localStorage.instructions == 'read' ) {
    $( '.instructions' ).hide();
}
$( '.instructions' ).click( function() {
    $( this ).fadeOut();
    localStorage.instructions = 'read';
} );
