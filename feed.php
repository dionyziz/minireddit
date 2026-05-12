<?php
    header( 'Content-Type: application/json' );

    if ( isset( $_GET[ 'r' ] ) ) {
        $subreddit = preg_replace( '#[^a-zA-Z0-9_+-]+#', '', $_GET[ 'r' ] );
    }
    else {
        $subreddit = 'funny';
    }
    if ( isset( $_GET[ 'limit' ] ) ) {
        $limit = max( 1, min( 100, ( int )$_GET[ 'limit' ] ) );
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
    $url = 'https://www.reddit.com/r/' . $subreddit . '.json?limit=' . $limit . '&after=' . $after;
    $context = stream_context_create( array(
        'http' => array(
            'header' => "User-Agent: minireddit/1.0\r\n",
            'timeout' => 10,
        ),
    ) );
    $response = @file_get_contents( $url, false, $context );

    if ( $response === false ) {
        http_response_code( 502 );
        echo json_encode( array(
            'error' => true,
            'message' => 'Could not load subreddit feed from reddit.',
        ) );
        exit;
    }

    echo $response;
?>
