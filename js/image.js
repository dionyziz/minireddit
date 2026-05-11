// TODO: completely toss this file and replace with a server-side component

function getImage(url) {
    switch (url.substr(-4).toLowerCase()) {
        case '.gif':
        case '.jpg':
        case '.png':
            return url;
    }
    if (url.substr(-5).toLowerCase() == '.jpeg') {
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

function getRedditVideo(post) {
    if (post.preview
      && post.preview.reddit_video_preview
      && post.preview.reddit_video_preview.fallback_url) {
        return post.preview.reddit_video_preview.fallback_url;
    }
    if (post.secure_media
      && post.secure_media.reddit_video
      && post.secure_media.reddit_video.fallback_url) {
        return post.secure_media.reddit_video.fallback_url;
    }
    if (post.media
      && post.media.reddit_video
      && post.media.reddit_video.fallback_url) {
        return post.media.reddit_video.fallback_url;
    }
    return false;
}

function getVideo(url) {
    var lowerURL = url.toLowerCase();

    if (lowerURL.substr(-5) == '.gifv') {
        return url.substr(0, url.length - 5) + '.mp4';
    }
    if (lowerURL.substr(-4) == '.mp4'
      || lowerURL.substr(-5) == '.webm') {
        return url;
    }
    return false;
}

function getMedia(post) {
    var videoURL = getRedditVideo(post) || getVideo(post.url);

    if (videoURL !== false) {
        return {
            type: 'video',
            url: videoURL
        };
    }

    var imageURL = getImage(post.url);
    if (imageURL !== false) {
        return {
            type: 'image',
            url: imageURL
        };
    }

    return false;
}
