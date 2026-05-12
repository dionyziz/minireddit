<?php
    header( 'Content-Type: application/json' );

    if ( isset( $_GET[ 'name' ] ) ) {
        $name = preg_replace( '#[^a-zA-Z0-9_]+#', '', $_GET[ 'name' ] );
        if ( $name === '' ) {
            http_response_code( 400 );
            echo json_encode( array(
                'error' => true,
                'message' => 'Invalid post id.',
            ) );
            exit;
        }
        $context = stream_context_create( array(
            'http' => array(
                'header' => "User-Agent: minireddit/1.0\r\n",
                'timeout' => 10,
            ),
        ) );
        $response = @file_get_contents( 'https://www.reddit.com/by_id/' . $name . '.json', false, $context );

        if ( $response === false ) {
            http_response_code( 502 );
            echo json_encode( array(
                'error' => true,
                'message' => 'Could not load post from reddit.',
            ) );
            exit;
        }

        echo $response;
    }
?>
