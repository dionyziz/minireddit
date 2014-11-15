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
        <link href='css/dashboard.css' rel='stylesheet' />
        <link rel='icon' type='image/png' href='images/300px_grin.png' />
    </head>
    <body id='r_<?php
        echo $subreddit;
        ?>'>
        <div class='dashboard'>
            <div class="subreddits">
                <div class='loadingGif'>
                    <p>Loading</p>
                    <img src="images/loading.gif" width="32" height="32" />
                </div>
                <ol></ol>
            </div>
            <div class='copy'>
                <span>❤</span> minireddit <a href='https://github.com/dionyziz/minireddit'><img src='images/github_256.png' /></a>
            </div>
        </div>
        <div class='content'>
            <h2 class='title'></h2>
            <div class='imgcontainer'>
                <img src='' id='img' />
            </div>
            <div id='loading'>
                <div class='text'>
                    Loading...
                </div>
                <div class='progress'><div class='progressbar'></div></div>
                <img src='images/bouncing-ball.gif' alt='loading' id='bounce' />
            </div>
            <div class='instructions'>
                Press <span>j</span> to go to the next image.
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
            <div style='clear:both'></div>
        </div>
        <script src='http://code.jquery.com/jquery-1.8.1.min.js'></script>
        <script src='js/json2.js'></script>
        <script src='js/reddit.js'></script>
        <script src='js/string.js'></script>
        <script src='js/storage.js'></script>
        <script src='js/keyboard.js'></script>
        <script src='js/image.js'></script>
        <script src='js/preloading.js'></script>
        <script src='js/renderer.js'></script>
        <script src='js/dashboard.js'></script>
        <script src='js/behavior.js'></script>
        <script src='js/vector.js'></script>
        <script src='js/ui.js'></script>
        <script src='js/analytics.js'></script>
    </body>
</html>
