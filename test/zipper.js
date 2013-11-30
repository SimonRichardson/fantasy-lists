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

function left(a) {
    return a.y.cata({
        Cons: function(x, y) {
            var left = List.of(x),
                right = y();
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function right(a) {
    return a.x.cata({
        Cons: function(x, y) {
            var left = y(),
                right = List.of(x);
            return Zipper(left, right);
        },
        Nil: Zipper.empty
    });
}

function moveLeft(a) {
    return a.left();
}

function moveRight(a) {
    return a.right();
}

function moveToFirst(a) {
    return a.first();
}

function moveToLast(a) {
    return a.last();
}

function same(a, b) {
    return a.zipWith(b).fold(true, function(a, b) {
        return a && b._1 === b._2;
    });
}

function expected(a, c, b) {
    return a.length < 1 || c > a.length ? Option.None : Option.of(b);
}

function chains(n, a, f) {
    return n < 1 ? a : chains(n - 1, a.chain(f), f);
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
    // Left & Right
    'testing zipper left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.left(),
                Option.None
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
                expected(a, 1, right(Zipper.of(list)))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right multiple times should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                chains(2, zipper.right(), moveRight),
                expected(a, 3, right(right(right(Zipper.of(list)))))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right then left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.right().chain(moveLeft),
                expected(a, 0, Zipper.of(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right multiple times then left': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);

            return equals(
                chains(a.length - 1, zipper.right(), moveRight).chain(moveLeft),
                expected(
                    a,
                    0,
                    Zipper(
                        List.fromArray(a.slice(-1)),
                        List.fromArray(a.slice(0, a.length - 1).reverse())
                    )
                )
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    
    // First & Last
    'testing zipper first on a zipper in first position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.first(),
                Option.of(Zipper.of(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper first after right on a zipper': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.right().chain(moveToFirst),
                expected(a, 1, Zipper.of(list))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper last on a zipper in first position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.last(),
                Option.of(Zipper(List.Nil, list.reverse()))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper last on a zipper in last position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                chains(3, zipper.last(), moveToLast),
                Option.of(Zipper(List.Nil, list.reverse()))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper last then left on a zipper in last position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.last().chain(moveLeft),
                expected(a, a.length - 2, Zipper(last(list), init(list)))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    )
};
