<?php
    function get_file_size($url) { 
        foreach (get_headers($url, 1) as $k => $v) {
            if (strtolower($k) == 'content-length') {
                return (int)$v;
            }
        }
        return -1;
    } 

    if (!isset($_GET['url'])) {
        ?>-1<?php
        exit();
    }
    $url = $_GET['url'];
    
    echo(get_file_size($url));
?>
