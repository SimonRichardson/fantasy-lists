var bounces = require('bounces'),
    daggy = require('daggy'),
    combinators = require('fantasy-combinators'),

    constant = combinators.constant,
    identity = combinators.identity,

    List = daggy.taggedSum({
        Cons: ['head', 'tail'],
        Nil: []
    });

// Methods
List.of = function(x) {
    return List.Cons(x, function() {
        return List.Nil;
    });
};
List.empty = function() {
    return List.Nil;
};
List.fromArray = function(a) {
    var rec = function(y) {
        if (y < a.length) {
            var next = y + 1,
                head = a.slice(y, next);
            return List.Cons(head, function() {
                return rec(next);
            });
        } else return List.Nil;
    };
    return rec(0);
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
                    return rec(a.tail(), f(b, a.head));
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
    return this.reverse().fold(x, function(a, b) {
        return a.cata({
            Nil: constant(a),
            Cons: function() {
               return List.Cons(b, constant(a));
            }
        });
    });
};
List.prototype.map = function(f) {
    return this.chain(function(x) {
        return List.Cons(f(x), function(){
            return List.Nil;
        });
    });
};
List.prototype.reverse = function() {
    return this.fold(List.Nil, function(a, b) {
        return List.Cons(b, constant(a));
    });
};

// Export
if(typeof module != 'undefined')
    module.exports = List;
