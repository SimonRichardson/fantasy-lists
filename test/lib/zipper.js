var lists = require('../../fantasy-lists'),
    
    List = lists.List,
    Zipper = lists.Zipper;

function backwards(a) {
    return a.y.cata({
        Cons: function(x, y) {
            var left = List.of(x),
                right = y();
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function forwards(a) {
    return a.x.cata({
        Cons: function(x, y) {
            var left = y(),
                right = List.of(x);
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

if (typeof module != 'undefined')
    module.exports = {
        backwards: backwards,
        forwards: forwards
    };
