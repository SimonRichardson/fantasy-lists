var λ = require('fantasy-check/src/adapters/nodeunit'),
    combinators = require('fantasy-combinators'),
    lists = require('../fantasy-lists'),
    Option = require('fantasy-options'),

    constant = combinators.constant,

    List = lists.List,
    Zipper = lists.Zipper;

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
            return null;
        }
    });
}
function init(a) {
    return a.reverse().cata({
        Cons: function(a, b) {
            return b();
        },
        Nil: function() {
            return null;
        }
    });
}

function left(a) {
    return a.cata({
        Cons: function(x, y) {
            var left = List.of(x),
                right = y();
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function right(a) {
    return a.cata({
        Cons: function(x, y) {
            var left = y(),
                right = List.of(x);
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function same(a, b) {
    return a.zipWith(b).fold(true, function(a, b) {
        return a && b._1 === b._2;
    });
}

function equals(a, b) {
    return a.cata({
        Some: function(zip0) {
            return b.cata({
                Some: function(zip1) {
                    return same(zip0.x, zip1.x) && same(zip0.y, zip1.y);
                },
                None: constant(false)
            });
        },
        None: function() {
            return b.cata({
                Some: constant(false),
                None: constant(true)
            });
        }
    });
}

exports.zipper = {

    // Manual tests
    /*'testing zipper first on a zipper in first position should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.first(),
                a.length < 1 ? Option.None : Option.of(Zipper.of(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),*/
    'testing zipper last on a zipper in first position should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.last(),
                a.length < 1 ? Option.None : Option.of(Zipper(last(list), init(list)))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.left(),
                a.length < 1 ? Option.None : Option.of(Zipper.of(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right then left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.right().chain(function(a) {
                    return a.left();
                }),
                zipper.left()
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.right(),
                a.length < 1 ? Option.None : Option.of(right(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    )
};
