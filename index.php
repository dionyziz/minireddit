<?php
    if ( !empty( $_GET[ 'r' ] ) ) {
        $subreddit = preg_replace( '#[^a-zA-Z0-9_-]+#', '', $_GET[ 'r' ] );
    }
    else {
        $subreddit = 'funny';
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>/r/<?php
        echo $subreddit;
        ?> - MiniReddit</title>
        <link href='css/style.css' rel='stylesheet' />
        <link rel='icon' type='image/png' href='images/grin.png' />
    </head>
    <body id='r_<?php
        echo $subreddit;
        ?>'>
        <h2></h2>
        <img src='' id='img' />
        <img src='images/bouncing-ball.gif' id='loading' />
        <div class='instructions'>
            Press <span>j</span> to go to the next image.
        </div>
        <div class='bubble'>
            Choose a subreddit:
            <ul>
                <?php
                    $subreddits = array(
                        'pics', 'funny', 'WTF', 'atheism',
                        'aww', 'AdviceAnimals', 'fffffffuuuuuuuuuuuu'
                    );

                    foreach ( $subreddits as $link ) {
                        ?><li<?php
                        if ( strtolower( $link ) == strtolower( $subreddit ) ) {
                            ?> class='selected'<?php
                        }
                        ?>><a href='<?php
                        echo $link;
                        ?>'>/r/<?php
                        echo $link;
                        ?></a></li><?php
                    }
                ?>
            </ul>
            <a href='https://github.com/dionyziz/minireddit' class='developers' title='Fork me on GitHub' target='_blank'><img src='images/github_icon.png' alt='GitHub' /></a>
        </div>
        <ul class='info'>
            <li><a href='' id='settings'><img src='images/settings.png' alt='Settings' /></a></li>
            <li><a href='' class='reddit' target='_blank'><img src='images/reddit_16.png' alt='Reddit' /></a></li>
        </ul>
        <script src='http://code.jquery.com/jquery-1.8.1.min.js'></script>
        <script src='js/json2.js'></script>
        <script src='js/behavior.js'></script>
        <script>
          var _gaq = [
              [ '_setAccount', 'UA-37042847-1' ],
              [ '_trackPageview' ]
          ];

          ( function() {
              var ga = document.createElement( 'script' );
              ga.async = true;
              ga.src = 'http://www.google-analytics.com/ga.js';
              var s = document.getElementsByTagName( 'script' )[ 0 ];
              s.parentNode.insertBefore( ga, s );
          } )();
        </script>
    </body>
</html>
