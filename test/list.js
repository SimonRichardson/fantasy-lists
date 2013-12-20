var λ = require('./lib/test'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),
    semigroup = require('fantasy-check/src/laws/semigroup'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),
    lists = require('../fantasy-lists'),

    Identity = require('fantasy-identities'),
    Tuple2 = tuples.Tuple2,
    List = lists.List,

    constant = combinators.constant,
    identity = combinators.identity,
    randomRange = helpers.randomRange;

function isEven(a) {
    return (a % 2) === 0;
}

function run(a) {
    var concat = function(a, b) {
            return a.concat(b.toString());
        },
        show = function(a) {
            return '[' + a.fold([], concat).toString() + ']';
        };
    return Identity.of(show(a));
}
function runT(a) {
    return run(a.run.x);
}

exports.list = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(List, run),
    'Identity (Applicative)': applicative.identity(λ)(List, run),
    'Composition (Applicative)': applicative.composition(λ)(List, run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(List, run),
    'Interchange (Applicative)': applicative.interchange(λ)(List, run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(List.of, run),
    'Identity (Functor)': functor.identity(λ)(List.of, run),
    'Composition (Functor)': functor.composition(λ)(List.of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(List, run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(List, run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(List, run),
    'Associativity (Monad)': monad.associativity(λ)(List, run),

    // Monoid tests
    'All (Monoid)': monoid.laws(λ)(List, run),
    'leftIdentity (Monoid)': monoid.leftIdentity(λ)(List, run),
    'rightIdentity (Monoid)': monoid.rightIdentity(λ)(List, run),
    'associativity (Monoid)': monoid.associativity(λ)(List, run),

    // Semigroup tests
    'All (Semigroup)': semigroup.laws(λ)(List.of, run),
    'associativity (Semigroup)': semigroup.associativity(λ)(List.of, run),

    // Manual tests
    'when using concat should concat in correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b);

            return λ.equals(x.concat(y), List.fromArray(a.concat(b)));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using take should take correct number': λ.check(
        function(a) {
            var x = List.fromArray(a),
                len = a.length,
                rnd = Math.floor(randomRange(0, len > 1 ? len : 0));
            return λ.equals(x.take(rnd), List.fromArray(a.slice(0, rnd)));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse should invert list to correct order': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = a.slice().reverse();

            return λ.equals(x.reverse(), List.fromArray(y));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse after concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.concat(b).slice().reverse();

            return λ.equals(x.concat(y).reverse(), List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse before concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.slice().reverse().concat(b);

            return λ.equals(x.reverse().concat(y), List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when testing from with large number then take is correct size': function(test) {
        var a = List.from(0, Math.pow(2, 53)),
            b = List.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        test.ok(λ.equals(a.take(10), List.fromArray(b)));
        test.done();
    },

    // Common
    'when testing filter should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.filter(isEven),
                z = λ.filter(a, isEven).reverse();
            return λ.equals(y, List.fromArray(z));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing first should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.first(),
                z = λ.first(a);
            return y.cata({
                Some: function(a) {
                    return z.cata({
                        Some: function(b) {
                            return a === b;
                        },
                        None: constant(false)
                    });
                },
                None: function() {
                    return z.cata({
                        Some: constant(false),
                        None: constant(true)
                    });
                }
            });
        },
        [λ.arrayOf(Number)]
    ),
    'when testing init should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.init(),
                z = λ.init(a);
            return λ.equals(y, List.fromArray(z));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing last should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.last(),
                z = λ.last(a);
            return y.cata({
                Some: function(a) {
                    return z.cata({
                        Some: function(b) {
                            return a === b;
                        },
                        None: constant(false)
                    });
                },
                None: function() {
                    return z.cata({
                        Some: constant(false),
                        None: constant(true)
                    });
                }
            });
        },
        [λ.arrayOf(Number)]
    ),
    'when testing partition should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.partition(isEven),
                z = λ.partition(a, isEven);
            return λ.equals(y._1, List.fromArray(z._1)) &&
                    λ.equals(y._1, List.fromArray(z._1));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing take should return correct list': λ.check(
        function(a) {
            var rnd = randomRange(0, a.length),
                x = List.fromArray(a),
                y = x.take(rnd),
                z = a.slice(0, rnd);
            return λ.equals(y, List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing zip should return correct list': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = x.zip(y),
                zz = λ.zip(a, b);
            return λ.equals(z, List.fromArray(zz), function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    )
};

exports.listT = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(List.ListT(Identity), runT),
    'Identity (Applicative)': applicative.identity(λ)(List.ListT(Identity), runT),
    'Composition (Applicative)': applicative.composition(λ)(List.ListT(Identity), runT),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(List.ListT(Identity), runT),
    'Interchange (Applicative)': applicative.interchange(λ)(List.ListT(Identity), runT),

    // Functor tests
    'All (Functor)': functor.laws(λ)(List.ListT(Identity).of, runT),
    'Identity (Functor)': functor.identity(λ)(List.ListT(Identity).of, runT),
    'Composition (Functor)': functor.composition(λ)(List.ListT(Identity).of, runT),

    // Monad tests
    'All (Monad)': monad.laws(λ)(List.ListT(Identity), runT),
    'Left Identity (Monad)': monad.leftIdentity(λ)(List.ListT(Identity), runT),
    'Right Identity (Monad)': monad.rightIdentity(λ)(List.ListT(Identity), runT),
    'Associativity (Monad)': monad.associativity(λ)(List.ListT(Identity), runT),

    // Monoid tests
    'All (Monoid)': monoid.laws(λ)(List.ListT(Identity), runT),
    'leftIdentity (Monoid)': monoid.leftIdentity(λ)(List.ListT(Identity), runT),
    'rightIdentity (Monoid)': monoid.rightIdentity(λ)(List.ListT(Identity), runT),
    'associativity (Monoid)': monoid.associativity(λ)(List.ListT(Identity), runT),

    // Semigroup tests
    'All (Semigroup)': semigroup.laws(λ)(List.ListT(Identity).of, runT),
    'associativity (Semigroup)': semigroup.associativity(λ)(List.ListT(Identity).of, runT),

    'when testing reverse should return correct listT': λ.check(
        function(a) {
            var ListT = List.ListT(Identity),
                x = ListT.fromArray(a).reverse(),
                y = ListT.fromArray(a.slice().reverse());
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing filter should return correct listT': λ.check(
        function(a) {
            var ListT = List.ListT(Identity),
                x = ListT.fromArray(a).filter(isEven),
                y = ListT.fromList(List.fromArray(a).filter(isEven));
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing partition should return correct listT': λ.check(
        function(a) {
            var ListT = List.ListT(Identity),
                x = ListT.fromArray(a).partition(isEven),
                y = ListT.fromList(List.fromArray(a).partition(isEven));
            return λ.equals(x.run.x._1, y.run.x._1, function(a) {
                    return function(b) {
                        return λ.arrayEquals(a, b);
                    };
                }) && λ.equals(x.run.x._2, y.run.x._2, function(a) {
                    return function(b) {
                        return λ.arrayEquals(a, b);
                    };
                });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing take should return correct listT': λ.check(
        function(a) {
            var ListT = List.ListT(Identity),
                rnd = randomRange(0, a.length),
                x = ListT.fromArray(a).take(rnd),
                y = ListT.fromList(List.fromArray(a).take(rnd));
            return λ.equals(x, y, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing zip should return correct listT': λ.check(
        function(a, b) {
            var ListT = List.ListT(Identity),
                x = ListT.fromArray(a),
                y = ListT.fromArray(b),
                z = x.zip(y),
                zz = ListT.fromList(List.fromArray(a).zip(List.fromArray(b)));
            return λ.equals(z, zz, function(a) {
                return function(b) {
                    return λ.arrayEquals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    )
};
