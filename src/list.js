var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),

    constant = combinators.constant,
    identity = combinators.identity,

    Tuple2 = tuples.Tuple2,
    List = daggy.taggedSum({
        Cons: ['head', 'tail'],
        Nil: []
    });

// Methods
List.of = function(x) {
    return List.Cons(x, constant(List.Nil));
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
            Nil: constant(b),
            Cons: function() {
                return rec(a.tail(), f(b, a.head));
            }
        });
    };
    return rec(this, v);
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
            Nil: function() {
                return List.of(b);
            },
            Cons: function() {
                return List.Cons(b, constant(a));
            }
        });
    });
};
List.prototype.map = function(f) {
    return this.chain(function(x) {
        return List.of(f(x));
    });
};
List.prototype.reverse = function() {
    return this.fold(List.Nil, function(a, b) {
        return List.Cons(b, constant(a));
    });
};

// Common
List.prototype.filter = function(f) {
    var rec = function(a, b) {
        return b.cata({
            Nil: constant(a),
            Cons: function(x, y) {
                return f(x) ?
                    rec(List.Cons(x, constant(a)), y()) :
                    rec(a, y());
            }
        });
    };
    return rec(List.Nil, this);
};
List.prototype.partition = function(f) {
    var rec = function(a, b) {
        return b.cata({
            Nil: constant(a),
            Cons: function(x, y) {
                return f(x) ?
                    rec(Tuple2(a._1.concat(List.of(x)), a._2), y()) :
                    rec(Tuple2(a._1, a._2.concat(List.of(x))), y());
            }
        });
    };
    return rec(
            Tuple2(
                List.Nil,
                List.Nil
            ),
            this
        );
};
List.prototype.take = function(x) {
    var rec = function(n, a) {
        return a.cata({
            Nil: constant(a),
            Cons: function(x, y) {
                if (n < 1)
                    return List.Nil;
                return List.Cons(x, function() {
                    return rec(n - 1, y());
                });
            }
        });
    };
    return rec(x, this);
};
List.prototype.zip = function(x) {
    var rec = function(a, b, c) {
        return b.cata({
            Nil: constant(a),
            Cons: function(bHead, bTail) {
                return c.cata({
                    Nil: constant(a),
                    Cons: function(cHead, cTail) {
                        return rec(
                            List.Cons(
                                Tuple2(bHead, cHead),
                                constant(a)
                            ),
                            bTail(),
                            cTail()
                        );
                    }
                });
            }
        });
    };
    return rec(List.Nil, this, x);
};

// IO
List.from = function(a, b) {
    var rec = function(x) {
        if (x <= b) {
            var next = x + 1;
            return List.Cons(x, function() {
                return rec(next);
            });
        } else return List.Nil;
    };
    return rec(a);
};
List.fromArray = function(a) {
    var rec = function(x) {
        if (x < a.length) {
            var next = x + 1,
                head = a.slice(x, next);
            return List.Cons(head[0], function() {
                return rec(next);
            });
        } else return List.Nil;
    };
    return rec(0);
};

// Export
if(typeof module != 'undefined')
    module.exports = List;
