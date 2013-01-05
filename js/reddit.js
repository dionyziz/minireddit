var Reddit = {
    downloadPost: function( name, callback ) {
        // post factory, download from reddit
        console.log( 'Loading post ' + name );
        $.get( 'post.php', {
            name: name
        }, function( postList ) {
            var post = postList.data.children[ 0 ].data;

            callback( new Reddit.Post( post.name, post.title, post.url ) );
        }, 'json' );
    },
    Post: function( name, title, url ) {
        this.name = name;
        this.title = title;
        this.url = url;

        // TODO: get rid of 'data'
        this.data = {
            name: name,
            title: title,
            url: url
        };
    },
};
