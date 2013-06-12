// TODO: completely toss this file and replace with a server-side component

function getImage(url) {
    switch (url.substr(-4).toLowerCase()) {
        case '.gif':
        case '.jpg':
        case '.png':
            return url;
    }
    if (url.beginsWith('http://imgur.com')
      ||url.beginsWith('http://quickmeme.com')
      ||url.beginsWith('http://qkme.me')) {
        console.log('Converted to image: ' + url);
        return 'imgur.php?url=' + encodeURIComponent(url) + '&type=.jpg';
    }
    return false;
}
