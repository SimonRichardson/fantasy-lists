var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),
    monoid = require('fantasy-check/src/laws/monoid'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),

    Identity = require('fantasy-identities'),
    List = require('../fantasy-lists').List,

    identity = combinators.identity,
    randomRange = helpers.randomRange;

function concat(a, b) {
    return a.concat(b);
}

function show(a) {
    return '[' + a.fold([], concat).toString() + ']';
}

function run(a) {
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

            return show(x.concat(y)) === '[' + a.concat(b).toString() + ']';
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using take should take correct number': λ.check(
        function(a) {
            var x = List.fromArray(a),
                len = a.length,
                rnd = Math.floor(randomRange(0, len > 1 ? len : 0));
            return show(x.take(rnd)) === '[' + a.slice(0, rnd).toString() + ']';
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse should invert list to correct order': λ.check(
        function(a) {
            var x = List.fromArray(a),
                y = a.slice().reverse();

            return show(x.reverse()) === '[' + y.toString() + ']';
        },
        [λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse after concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.concat(b).slice().reverse();

            return show(x.concat(y).reverse()) === '[' + z.toString() + ']';
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when using reverse before concat should invert list to correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b),
                z = a.slice().reverse().concat(b);

            return show(x.reverse().concat(y)) === '[' + z.toString() + ']';
        },
        [λ.arrayOf(λ.AnyVal), λ.arrayOf(λ.AnyVal)]
    ),
    'when testing from with large number then take is correct size': function(test) {
        var a = List.from(0, Math.pow(2, 53)),
            b = List.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        test.equals(show(a.take(10)), show(b));
        test.done();
    }
};
