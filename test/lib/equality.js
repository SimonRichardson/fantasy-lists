var helpers = require('fantasy-helpers');

function equals(a, b, f) {
    var g = f || helpers.strictEquals;
    return a.zip(b).fold(true, function(a, b) {
        return a && g(b._1)(b._2);
    });
}

if (typeof module != 'undefined')
    module.exports = equals;