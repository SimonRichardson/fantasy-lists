var λ = require('./lib/test'),
    combinators = require('fantasy-combinators'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),

    lists = require('../fantasy-lists'),
    Option = require('fantasy-options'),
    Identity = require('fantasy-identities'),

    constant = combinators.constant,

    List = lists.List,
    Zipper = lists.Zipper;

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
                    return λ.equals(zip0.x, zip1.x) && λ.equals(zip0.y, zip1.y);
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

function run(a) {
    var concat = function(a, b) {
            return a.concat(b.toString());
        },
        show = function(a) {
            return '[' + a.fold([], concat).toString() + ']';
        };
    return Identity.of(show(a.x) + show(a.y));
}

exports.zipper = {

    // Manual tests
    // Left & Right
    'testing zipper left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.backwards(),
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
                zipper.forwards(),
                expected(a, 1, λ.forwards(Zipper.of(list)))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right multiple times should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                chains(
                    2,
                    zipper.forwards(),
                    function(a) {
                        return a.forwards();
                    }
                ),
                expected(a, 3, λ.forwards(λ.forwards(λ.forwards(Zipper.of(list)))))
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing zipper right then left should return correct value': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return equals(
                zipper.forwards().chain(
                    function(a) {
                        return a.backwards();
                    }
                ),
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
                chains(
                    a.length - 1,
                    zipper.forwards(),
                    function(a) {
                        return a.forwards();
                    }
                ).chain(
                    function(a) {
                        return a.backwards();
                    }
                ),
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
                zipper.forwards().chain(
                    function(a) {
                        return a.first();
                    }
                ),
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
                chains(
                    3,
                    zipper.last(),
                    function(a) {
                        return a.last();
                    }
                ),
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
                zipper.last().chain(
                    function(a) {
                        return a.backwards();
                    }
                ),
                expected(
                    a,
                    a.length - 2,
                    Zipper(λ.last(list), λ.init(list))
                )
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing toList on a zipper in first position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list);
            return λ.equals(
                zipper.toList(),
                list
            );
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing toList on a zipper in last position': λ.check(
        function(a) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list),
                possible = zipper.last();
            return possible.cata({
                Some: function(x) {
                    return λ.equals(
                        x.toList(),
                        list
                    );
                },
                None: constant(true)
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'testing concat on a zipper in first position': λ.check(
        function(a, b) {
            var list = List.fromArray(a),
                zipper = Zipper.of(list),
                x = zipper.concat(Zipper.of(List.of(b))),
                y = list.concat(List.of(b));
                
            return λ.equals(
                x.toList(),
                y
            );
        },
        [λ.arrayOf(λ.AnyVal), λ.AnyVal]
    )
};
