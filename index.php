<?php
    // TODO: replace all server-side components with python

    $subreddit = '';
    if (!empty($_GET['r'])) {
        $subreddit = preg_replace('#[^a-zA-Z0-9_+-]+#', '', $_GET['r']);
    }
    if (empty($subreddit)) {
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
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300' rel='stylesheet' />
        <link href='css/style.css' rel='stylesheet' />
        <link href='css/toolbar.css' rel='stylesheet' />
        <link rel='icon' type='image/png' href='images/300px_grin.png' />
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

                    foreach ($subreddits as $link) {
                        ?><li<?php
                        if (strtolower($link) == strtolower($subreddit)) {
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
            <li><a href='' id='settings'>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </a></li>
            <li><a href='' id='reddit' target='_blank'>
                <span class='circle'></span>
                <span class='arrow'></span>
                <span class='head'></span>
            </a></li>
        </ul>
        <script src='http://code.jquery.com/jquery-1.8.1.min.js'></script>
        <script src='js/json2.js'></script>
        <script src='js/reddit.js'></script>
        <script src='js/string.js'></script>
        <script src='js/storage.js'></script>
        <script src='js/keyboard.js'></script>
        <script src='js/image.js'></script>
        <script src='js/preloading.js'></script>
        <script src='js/renderer.js'></script>
        <script src='js/behavior.js'></script>
        <script src='js/ui.js'></script>
        <script src='js/analytics.js'></script>
    </body>
</html>
