<?php
    if ( isset( $_GET[ 'r' ] ) ) {
        $subreddit = preg_replace( '#[^a-zA-Z]+#', '', $_GET[ 'r' ] );
    }
    else {
        $subreddit = 'funny';
    }
    if ( isset( $_GET[ 'limit' ] ) ) {
        $limit = ( int )$_GET[ 'limit' ];
    }
    else {
        $limit = 25;
    }
    if ( isset( $_GET[ 'after' ] ) ) {
        $after = preg_replace( '#[^a-zA-Z0-9_-]+#', '', $_GET[ 'after' ] );
    }
    else {
        $after = '';
    }
    $url = 'http://www.reddit.com/r/' . $subreddit . '.json?limit=' . $limit . '&after=' . $after;
    echo file_get_contents( $url );
?>
