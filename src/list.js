var bounces = require('bounces'),
    daggy = require('daggy'),
    combinators = require('fantasy-combinators'),

    identity = combinators.identity,

    List = daggy.taggedSum({
        Cons: ['car', 'cdr'],
        Nil: []
    });

// Methods
List.of = function(x) {
    return List.Cons(x, List.Nil);
};
List.empty = function() {
    return List.Nil;
};
List.prototype.chain = function(f) {
    return this.fold(
        List.Nil,
        function(a, b) {
            return a.concat(f(b));
        }
    );
};
List.prototype.fold = function(v, f) {
    var rec = function(a, b) {
        return a.cata({
            Nil: function() {
                return bounces.done(b);
            },
            Cons: function() {
                return bounces.cont(function() {
                    return rec(a.cdr, f(b, a.car));
                });
            }
        });
    };
    return bounces.trampoline(rec(this, v));
};

// Derived
List.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};
List.prototype.concat = function(x) {
    var rec = function(a, b, c) {
        return b.cata({
            Nil: function() {
                return c.cata({
                    Nil: function() {
                        return bounces.done(a);
                    },
                    Cons: function() {
                        return bounces.cont(function() {
                            return rec(List.Cons(c.car, a), List.Nil, c.cdr);
                        });
                    }
                });
            },
            Cons: function() {
                return bounces.cont(function() {
                    return rec(List.Cons(b.car, a), b.cdr, c);
                });
            }
        });
    };
    return bounces.trampoline(rec(List.Nil, x.reverse(), this.reverse()));
};
List.prototype.map = function(f) {
    return this.chain(function(x) {
        return List.Cons(f(x), List.Nil);
    });
};
List.prototype.reverse = function() {
    var rec = function(a, b) {
        return b.cata({
            Nil: function() {
                return bounces.done(a);
            },
            Cons: function(x, y) {
                return bounces.cont(function() {
                    return rec(List.Cons(x, a), y);
                });
            }
        });
    };
    return bounces.trampoline(rec(List.Nil, this));
};

// Export
if(typeof module != 'undefined')
    module.exports = List;
