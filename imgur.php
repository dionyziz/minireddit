<?php
    define( 'MAX_SIZE', 5 * 1024 * 1024 );
    define( 'BLOCK_SIZE', 8 * 1024 );

    function safeRead( $url ) {
        $handle = fopen( $url, 'r' );
        $buffer = '';
        while ( $block = fread( $handle, BLOCK_SIZE ) ) {
            $size += strlen( $block );
            if ( $size > MAX_SIZE ) {
                break;
            }
            $buffer .= $block;
        }
        return $buffer;
    }

    if ( isset( $_GET[ 'url' ] ) ) {
        if ( !preg_match( '#^http\\://imgur\\.com/.*#', $_GET[ 'url' ] ) ) {
            return;
        }

        $src = safeRead( $_GET[ 'url' ] );
        $start = strlen( 'src="' ) + strpos( $src, 'src=', strpos( $src, 'image-container' ) );
        $end = strpos( $src, '"', $start );

        $imgURL = substr( $src, $start, $end - $start );
        $type = strtolower( substr( $imgURL, -3 ) );

        if ( !preg_match( '#^http\\://.*(jpg|png)$#', $imgURL ) ) {
            return;
        }
        header( 'Content-Type: image/' . $type );
        echo safeRead( $imgURL );
    }
?>
