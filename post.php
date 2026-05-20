<?php
    if ( isset( $_GET[ 'name' ] ) ) {
        $url = 'https://www.reddit.com/by_id/' . $_GET[ 'name' ] . '.json';
        $context = stream_context_create( array(
            'http' => array(
                'header' => "User-Agent: minireddit/1.0\r\n"
            )
        ) );
        $response = @file_get_contents( $url, false, $context );

        header( 'Content-Type: application/json' );
        if ( $response === false ) {
            http_response_code( 502 );
            echo json_encode( array(
                'error' => 'Could not fetch reddit post.'
            ) );
            exit;
        }

        echo $response;
    }
?>
