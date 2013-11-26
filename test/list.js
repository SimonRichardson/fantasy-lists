var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),

    helpers = require('fantasy-helpers'),
    combinators = require('fantasy-combinators'),
    List = require('../fantasy-lists'),

    identity = combinators.identity;

exports.list = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(List, identity),
    'Identity (Applicative)': applicative.identity(λ)(List, identity),
    'Composition (Applicative)': applicative.composition(λ)(List, identity),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(List, identity),
    'Interchange (Applicative)': applicative.interchange(λ)(List, identity),

    // Functor tests
    'All (Functor)': functor.laws(λ)(List.of, identity),
    'Identity (Functor)': functor.identity(λ)(List.of, identity),
    'Composition (Functor)': functor.composition(λ)(List.of, identity),

    // Monad tests
    'All (Monad)': monad.laws(λ)(List, identity),
    'Left Identity (Monad)': monad.leftIdentity(λ)(List, identity),
    'Right Identity (Monad)': monad.rightIdentity(λ)(List, identity),
    'Associativity (Monad)': monad.associativity(λ)(List, identity),

    // Manual tests
    'test': function(test) {
        console.log(List.Cons(1, List.Cons(2, List.Nil)).concat(List.Cons('a', List.Cons('b', List.Nil))));
        test.done();
    }
};
