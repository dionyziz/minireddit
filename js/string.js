String.prototype.beginsWith = function( str ) {
    return this.substr( 0, str.length ) == str;
};
