var Storage = {
    read: {},
    localRead: {},
    isRead: function(name) {
        return typeof this.localRead[name] !== 'undefined';
    },
    markAsRead: function(post) {
        console.log('Marking ' + post.name + ' as read (' + post.title + ').');
        this.read[post.name] = true;
        this.save();
    },
    save: function() {
        if (typeof(localStorage) !== 'undefined') {
            // console.log('Saving to storage.');
            localStorage.read = JSON.stringify(this.read);
        }
    },
    load: function() {
        if (typeof(localStorage) !== 'undefined') {
            console.log('Local storage is supported');
        }
        else {
            console.log('Local storage is not supported');
            return;
        }

        if (typeof localStorage.read === 'undefined') {
            console.log('Storage is empty.');
            localStorage.read = '{}';
        }
        else {
            console.log('Loading from storage: ');
        }
        this.read = JSON.parse(localStorage.read);
        this.localRead = JSON.parse(localStorage.read);
        console.log('Loaded ' + Object.keys(this.read).length + ' read items from storage');
    }
}
