var Preloader = {
    queue: [],
    timer: null,
    speedEstimate: -1, // KB/s
    enqueue: function(url) {
        Preloader.queue.unshift(url);
        clearTimeout(Preloader.timer);
        Preloader.timer = setTimeout(Preloader.execute, 20);
    },
    updateEstimate: function(size, dt) {
        if (dt <= 100) {
            return;
        }
        
        var currentSpeed = Math.floor(size / dt);
        if (currentSpeed > 0) {
            if (Preloader.speedEstimate == -1) {
                Preloader.speedEstimate = currentSpeed;
            }
            else {
                // poor man's low-pass filter
                Preloader.speedEstimate = 0.8 * Preloader.speedEstimate + 0.2 * currentSpeed;
            }
        }
        console.log('Current estimated Internet speed: ' + Preloader.speedEstimate);
        // console.log('Loaded ' + url + ' of size ' + size + ' bytes in ' + dt + ' milliseconds.');
        // console.log('Estimated Internet speed: ' + Math.floor(size / dt) + 'KB/s')
    },
    execute: function() {
        if (Preloader.queue.length == 0) {
            return;
        }

        var url = Preloader.queue.pop();

        console.log('Preloading ' + url);
        var t = (new Date()) | 0;
        var img = new Image();    
        img.onload = img.onerror = function() {
            var dt = ((new Date()) | 0) - t;
            $.get('size.php', {
                url: url
            }, function(size) {
                if (size <= 0) {
                    return;
                }
                Preloader.updateEstimate(size, dt);
            });
            Preloader.execute();
        };
        img.src = url;
    }
};
