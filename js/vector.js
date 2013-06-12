function Vector(x, y) {
    this.x = x;
    this.y = y;
}

var EPSILON = 0.0001;

Vector.prototype = {
    constructor: Vector,
    plus: function(a) {
        return new Vector(this.x + a.x, this.y + a.y);
    },
    scale: function(lambda) {
        return new Vector(lambda * this.x, lambda * this.y);
    },
    negate: function() {
        return this.scale(-1);
    },
    minus: function(a) {
        return this.plus(a.negate());
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var l = this.length();
        if (l < EPSILON) {
            throw 'Cannot normalize zero vector';
        }
        return this.scale(1 / l);
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y;
    }
};
