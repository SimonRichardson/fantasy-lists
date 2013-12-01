var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),
    array = require('./common/array'),
    equals = require('./common/equality'),

    Identity = require('fantasy-identities'),
    List = require('../fantasy-lists').List,

    Tuple2 = tuples.Tuple2,

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

    // Manual tests
    'when using concat should concat in correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b);

            return equals(x.concat(y), List.fromArray(a.concat(b)));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using take should take correct number': λ.check(
        function(a) {
            var x = List.fromArray(a),
                len = a.length,
                rnd = Math.floor(randomRange(0, len > 1 ? len : 0));
            return equals(x.take(rnd), List.fromArray(a.slice(0, rnd)));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse should invert list to correct order': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = a.slice().reverse();

            return equals(x.reverse(), List.fromArray(y));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse after concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.concat(b).slice().reverse();

            return equals(x.concat(y).reverse(), List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse before concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.slice().reverse().concat(b);

            return equals(x.reverse().concat(y), List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when testing from with large number then take is correct size': function(test) {
        var a = List.from(0, Math.pow(2, 53)),
            b = List.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        test.ok(equals(a.take(10), List.fromArray(b)));
        test.done();
    },

    // Common
    'when testing filter should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.filter(isEven),
                z = array.filter(a, isEven).reverse();
            return equals(y, List.fromArray(z));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing partition should return correct list': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = x.partition(isEven),
                z = array.partition(a, isEven);
            return equals(y._1, List.fromArray(z._1)) &&
                    equals(y._1, List.fromArray(z._1));
        },
        [λ.arrayOf(Number)]
    ),
    'when testing take should return correct list': λ.check(
        function(a) {
            var rnd = randomRange(0, a.length),
                x = List.fromArray(a),
                y = x.take(rnd),
                z = a.slice(0, rnd);
            return equals(y, List.fromArray(z));
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when testing zip should return correct list': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = x.zip(y),
                zz = array.zip(a, b);
            return equals(z, List.fromArray(zz), function(a) {
                return function(b) {
                    return array.equals(a, b);
                };
            });
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    )
};
