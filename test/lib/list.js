var lists = require('../../fantasy-lists'),
    combinators = require('fantasy-combinators'),
    constant = combinators.constant,

    List = lists.List;

function isEmpty(a) {
    return a.cata({
        Cons: constant(false),
        Nil: constant(true)
    });
}

function last(a) {
    return a.cata({
        Cons: function(a, b) {
            var x = b();
            return isEmpty(x) ? List.of(a) : last(x);
        },
        Nil: function() {
            return List.Nil;
        }
    });
}
function init(a) {
    return a.reverse().cata({
        Cons: function(a, b) {
            return b();
        },
        Nil: function() {
            return List.Nil;
        }
    });
}

if (typeof module != 'undefined')
    module.exports = {
        isEmpty: isEmpty,
        last: last,
        init: init
    };
