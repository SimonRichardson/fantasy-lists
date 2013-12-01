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
Zipper.prototype.backwards = function() {
    var scope = this;
    return scope.y.cata({
        Cons: function(a, b) {
            return Option.of(
                Zipper(
                    List.of(a).concat(scope.x),
                    b()
                )
            );
        },
        Nil: constant(Option.None)
    });
};
Zipper.prototype.forwards = function() {
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
    return this.backwards().chain(function(x) {
        return x.first();
    }).orElse(Option.of(this));
};
Zipper.prototype.last = function() {
    return this.forwards().chain(function(x) {
        return x.last();
    }).orElse(Option.of(this));
};

Zipper.prototype.append = function(a) {
    return Zipper(this.x.concat(a), this.y);
};
Zipper.prototype.prepend = function(a) {
    return Zipper(a.concat(this.x), this.y);
};
Zipper.prototype.remove = function() {
    var scope = this;
    return this.x.cata({
        Cons: function(a, b) {
            return Option.of(Zipper(b(), scope.y));
        },
        Nil: constant(Option.None)
    });
};

Zipper.prototype.asList = function() {
    var scope = this;
    return scope.y.cata({
        Cons: function(a, b) {
            return Zipper(
                List.of(a).concat(scope.x),
                b()
            ).asList();
        },
        Nil: constant(scope.x)
    });
};

// Export
if(typeof module != 'undefined')
    module.exports = Zipper;