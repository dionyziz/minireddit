<?php
    if ( isset( $_GET[ 'r' ] ) ) {
        $subreddit = preg_replace( '#[^a-zA-Z0-9_-]+#', '', $_GET[ 'r' ] );
    }
    else {
        $subreddit = 'funny';
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>/r/<?php
        echo $subreddit;
        ?></title>
        <link href='css/style.css' rel='stylesheet' />
        <link rel='icon' type='image/png' href='images/grin.png' />
    </head>
    <body id='r_<?php
        echo $subreddit;
        ?>'>
        <h2></h2>
        <img src='' id='img' />
        <img src='images/ajax-loader.gif' id='loading' />
        <div>
            Press <span>j</span> to go to the next image.
        </div>
        <script src='http://code.jquery.com/jquery-1.8.1.min.js'></script>
        <script src='js/json2.js'></script>
        <script src='js/behavior.js'></script>
    </body>
</html>
