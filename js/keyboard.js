$(window).keydown(function(e) {
    switch (e.keyCode) {
        case 39: // right
        case 74: // j
            $('.instructions').fadeOut();
            localStorage.instructions = 'read';
            next();
            break;
        case 37: // left
        case 75: // k
            prev();
            break;
    }
});
