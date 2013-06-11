var Preloader = {
    queue: [],
    timer: null,
    enqueue: function(url) {
        Preloader.queue.unshift(url);
        clearTimeout(Preloader.timer);
        Preloader.timer = setTimeout(Preloader.execute, 20);
    },
    execute: function() {
        if (Preloader.queue.length == 0) {
            return;
        }

        var url = Preloader.queue.pop();

        console.log('Preloading ' + url);
        var img = new Image();    
        img.onload = img.onerror = function() {
            Preloader.execute();
        };
        img.src = url;
    }
};
