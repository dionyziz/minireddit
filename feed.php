<?php
    function send_json_error( $code, $error ) {
        header( 'Content-Type: application/json', true, $code );
        echo json_encode( array(
            'error' => $error
        ) );
    }

    function get_status_code( $headers ) {
        $status = 0;

        foreach ( $headers as $header ) {
            if ( preg_match( '#^HTTP/\S+\s+([0-9]+)#', $header, $matches ) ) {
                $status = ( int )$matches[ 1 ];
            }
        }
        return $status;
    }

    if ( isset( $_GET[ 'r' ] ) ) {
        $subreddit = preg_replace( '#[^a-zA-Z0-9_+-]+#', '', $_GET[ 'r' ] );
    }
    else {
        $subreddit = 'funny';
    }
    if ( empty( $subreddit ) ) {
        $subreddit = 'funny';
    }
    if ( isset( $_GET[ 'limit' ] ) ) {
        $limit = ( int )$_GET[ 'limit' ];
    }
    else {
        $limit = 25;
    }
    $limit = min( 100, max( 1, $limit ) );

    if ( isset( $_GET[ 'after' ] ) ) {
        $after = preg_replace( '#[^a-zA-Z0-9_-]+#', '', $_GET[ 'after' ] );
    }
    else {
        $after = '';
    }
    $url = 'https://www.reddit.com/r/' . $subreddit . '.json?' . http_build_query( array(
        'limit' => $limit,
        'after' => $after
    ) );
    $context = stream_context_create( array(
        'http' => array(
            'ignore_errors' => true,
            'timeout' => 10,
            'header' => "User-Agent: minireddit/1.0 (+https://github.com/dionyziz/minireddit)\r\n"
        )
    ) );

    $response = @file_get_contents( $url, false, $context );
    $status = isset( $http_response_header ) ? get_status_code( $http_response_header ) : 0;

    if ( $status == 404 ) {
        send_json_error( 404, 'not_found' );
        return;
    }
    if ( $response === false || $status < 200 || $status >= 300 || empty( $response ) ) {
        send_json_error( 502, 'upstream_error' );
        return;
    }
    if ( json_decode( $response ) === null ) {
        send_json_error( 502, 'upstream_error' );
        return;
    }

    header( 'Content-Type: application/json' );
    echo $response;
?>
