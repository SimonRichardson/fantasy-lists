var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),

    Identity = require('fantasy-identities'),
    List = require('../fantasy-lists'),

    identity = combinators.identity;

λ.goal = 10;

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

    // Manual tests
    'when using concat should concat in correct order': λ.check(
        function(a, b) {
            var x = List.fromArray(a),
                y = List.fromArray(b);

            return show(x.concat(y)) === '[' + a.concat(b).toString() + ']';
        },
        [λ.arrayOf(Number), λ.arrayOf(Number)]
    )
};
