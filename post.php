<?php
    if ( isset( $_GET[ 'name' ] ) ) {
        echo file_get_contents( 'http://www.reddit.com/by_id/' . $_GET[ 'name' ] . '.json' );
    }
?>
