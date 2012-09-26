<?php
    define( 'MAX_SIZE', 5 * 1024 * 1024 );
    define( 'BLOCK_SIZE', 8 * 1024 );

    function safeRead( $url ) {
        $handle = fopen( $url, 'r' );
        $buffer = '';
        while ( $block = fread( $handle, BLOCK_SIZE ) ) {
            $size += strlen( $block );
            if ( $size > MAX_SIZE ) {
                echo "Maximum file size exceeded.\n";
                break;
            }
            $buffer .= $block;
        }
        return $buffer;
    }

    if ( isset( $_GET[ 'url' ] ) ) {
        if ( !preg_match( '#^http\\://imgur\\.com/.*#', $_GET[ 'url' ] ) ) {
            echo "The image page is not on imgur.\n";
            return;
        }

        $src = safeRead( $_GET[ 'url' ] );
        $imageContainerPos = strpos( $src, 'image-container' );
        if ( $imageContainerPos === false ) {
            $imageContainerPos = strpos( $src, 'id="content"' );
            if ( $imageContainerPos === false ) {
                echo "No 'image-container' or 'content' div found.\n";
                return;
            }
        }
        $srcPos = strpos( $src, 'src=', $imageContainerPos );
        if ( $srcPos === false ) {
            echo "No image 'src' attribute found.\n";
            return;
        }
        $start = strlen( 'src="' ) + $srcPos;
        $end = strpos( $src, '"', $start );

        $imgURL = substr( $src, $start, $end - $start );
        // imgur uses ?1 etc. to force uncache in cases of update -- strip that if it exists
        $imgRequest = explode( '?', $imgURL );
        $imgURL = $imgRequest[ 0 ];

        $type = strtolower( substr( $imgURL, -3 ) );

        if ( !preg_match( '#^http\\://.*(jpg|png|gif)$#', $imgURL ) ) {
            echo "The image source '" . htmlspecialchars( $imgURL ) . "' is not jpg or png.\n";
            return;
        }
        header( 'Content-Type: image/' . $type );
        echo safeRead( $imgURL );
    }
    else {
        echo "The URL parameter is not set.\n";
    }
?>
