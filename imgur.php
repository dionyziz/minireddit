<?php
    error_reporting( E_ALL );
    ini_set( 'display_errors', 1 );

    define( 'MAX_SIZE', 5 * 1024 * 1024 );
    define( 'BLOCK_SIZE', 8 * 1024 );

    function error( $message ) {
        header( "Content-type: text/plain" );
        echo $message;
        echo "\n";

        if ( isset( $_GET[ 'url' ] ) ) {
            echo "Input URL was: " . $_GET[ 'url' ] . "\n";
        }
    }

    function safeRead( $url ) {
        $handle = fopen( $url, 'r' );
        $buffer = '';
        $size = 0;
        while ( $block = fread( $handle, BLOCK_SIZE ) ) {
            $size += strlen( $block );
            if ( $size > MAX_SIZE ) {
                return error( "Maximum file size exceeded." );
            }
            $buffer .= $block;
        }
        return $buffer;
    }

    if ( isset( $_GET[ 'url' ] ) ) {
        $url = $_GET[ 'url' ];
        if ( preg_match( '#^http\\://imgur\\.com/.*#', $url ) ) {
            $src = safeRead( $url );
            $imageContainerPos = strpos( $src, 'image-container' );
            if ( $imageContainerPos === false ) {
                $imageContainerPos = strpos( $src, 'id="content"' );
                if ( $imageContainerPos === false ) {
                    return error( "No 'image-container' or 'content' div found." );
                }
            }
            $srcPos = strpos( $src, 'src=', $imageContainerPos );
            if ( $srcPos === false ) {
                return error( "No image 'src' attribute found." );
            }
            $start = strlen( 'src="' ) + $srcPos;
            $end = strpos( $src, '"', $start );

            $imgURL = substr( $src, $start, $end - $start );
            // imgur uses ?1 etc. to force uncache in cases of update -- strip that if it exists
            $imgRequest = explode( '?', $imgURL );
            $imgURL = $imgRequest[ 0 ];
        }
        else if ( preg_match( '#^http\\://(www\\.)?(quickmeme\\.com|qkme\\.me)/.*#', $url ) ) {
            $src = safeRead( $url );
            $imagePos = strpos( $src, 'id="img"' );
            $srcPos = strpos( $src, 'src=', $imagePos );
            $start = strlen( 'src="' ) + $srcPos;
            $end = strpos( $src, '"', $start );

            $imgURL = substr( $src, $start, $end - $start );
        }
        else {
            return error( 'This image is neither on imgur nor on quickmeme.' );
        }

        if ( !preg_match( '#^http\\://.*(jpg|png|gif)$#', $imgURL ) ) {
            return error( "The image source '" . htmlspecialchars( $imgURL ) . "' is not jpg, gif or png.\n" );
        }
        $type = strtolower( substr( $imgURL, -3 ) );
        header( 'Content-Type: image/' . $type );
        echo safeRead( $imgURL );
    }
    else {
        return error( 'The URL parameter is not set.' );
    }
?>
