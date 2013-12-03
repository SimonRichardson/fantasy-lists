var tuples = require('fantasy-tuples'),
    Tuple2 = tuples.Tuple2;

function filter(a, f) {
    var accum = [],
        i;
    for(i = 0; i < a.length; i++) {
        if (f(a[i]))
            accum.push(a[i]);
    }
    return accum;
}

function partition(a, f) {
    var accum = Tuple2([], []),
        i, p;
    for(i = 0; i < a.length; i++) {
        p = f(a[i]) ? accum._1 : accum._2;
        p.push(a[i]);
    }
    return accum;
}

function zip(a, b) {
    var accum = [],
        total = Math.min(a.length, b.length),
        i;
    for(i = 0; i < total; i++) {
        accum.push(Tuple2(a[i], b[i]));
    }
    return accum;
}

function fold(a, v, f) {
    var i;
    for(i = 0; i < a.length; i++) {
        v = f(v, a[i]);
    }
    return v;
}

function equals(a, b) {
    return fold(zip(a, b), true, function(a, b) {
        return a && b._1 === b._2;
    });
}

if (typeof module != 'undefined')
    module.exports = {
        filter: filter,
        partition: partition,
        zip: zip,
        fold: fold,
        arrayEquals: equals
    };