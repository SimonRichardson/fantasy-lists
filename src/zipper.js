var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    Option = require('fantasy-options'),
    List = require('./list'),

    constant = combinators.constant,

    Zipper = daggy.tagged('x', 'y');

Zipper.of = function(x) {
    return Zipper(x, List.Nil);
};
Zipper.empty = function() {
    return Zipper(List.Nil, List.Nil);
};
Zipper.prototype.left = function() {
    var scope = this;
    return scope.y.cata({
        Cons: function(a, b) {
            return Option.of(
                Zipper(
                    scope.x.prepend(List.of(a)),
                    b()
                )
            );
        },
        Nil: constant(Option.None)
    });
};
Zipper.prototype.right = function() {
    var scope = this;
    return scope.x.cata({
        Cons: function(a, b) {
            return Option.of(
                Zipper(
                    b(),
                    List.of(a).concat(scope.y)
                )
            );
        },
        Nil: constant(Option.None)
    });
};
Zipper.prototype.first = function() {
    return this.left().chain(function(x) {
        return x.first();
    }).orElse(Option.of(this));
};
Zipper.prototype.last = function() {
    return this.right().chain(function(x) {
        return x.last();
    }).orElse(Option.of(this));
};

// Export
if(typeof module != 'undefined')
    module.exports = Zipper;