var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),

    Option = require('fantasy-options'),

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
List.prototype.first = function() {
    return this.cata({
        Cons: function(x) {
            return Option.of(x);
        },
        Nil: function() {
            return Option.None;
        }
    });
};
List.prototype.init = function() {
    return this.cata({
        Cons: function(x, y) {
            return y();
        },
        Nil: List.empty
    });
};
List.prototype.last = function() {
    return this.fold(Option.None, function(a, b) {
        return Option.of(b);
    });
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

// Transformer
List.ListT = function(M) {
    var ListT = daggy.tagged('run'),
        sequence = function(x) {
            return x.fold(M.of(List.empty()), function(a, b) {
                return a.chain(function(x) {
                    return b.chain(function(y) {
                        return M.of(x.concat(y));
                    });
                });
            });
        };
    ListT.of = function(x) {
        return ListT(M.of(List.of(x)));
    };
    ListT.empty = function() {
        return ListT(M.of(List.empty()));
    };
    ListT.prototype.fold = function(a, b) {
        return this.run.chain(function(o) {
            return M.of(o.fold(a, b));
        });
    };
    ListT.prototype.chain = function(f) {
        var m = this.run;
        return ListT(m.chain(function(o) {
            return sequence(
                o.fold(List.empty(), function(a, b) {
                    return a.concat(List.of(f(b).run));
                })
            );
        }));
    };
    ListT.prototype.concat = function(x) {
        return ListT(sequence(
            List.of(this.run).concat(List.of(x.run))
        ));
    };
    ListT.prototype.map = function(f) {
        return this.chain(function(a) {
            return ListT.of(f(a));
        });
    };
    ListT.prototype.ap = function(a) {
        return this.chain(function(f) {
            return a.map(f);
        });
    };
    ListT.prototype.reverse = function() {
        var m = this.run;
        return ListT(m.map(function(x) {
            return x.reverse();
        }));
    };

    // Common
    ListT.prototype.filter = function(f) {
        var m = this.run;
        return ListT(m.map(function(x) {
            return x.filter(f);
        }));
    };
    ListT.prototype.partition = function(f) {
        var m = this.run;
        return ListT(m.map(function(x) {
            return x.partition(f);
        }));
    };
    ListT.prototype.take = function(n) {
        var m = this.run;
        return ListT(m.map(function(x) {
            return x.take(n);
        }));
    };
    ListT.prototype.zip = function(x) {
        var m = this.run,
            n = x.run;
        return ListT(m.chain(function(x) {
            return n.map(function(y) {
                return x.zip(y);
            });
        }));
    };

    // IO
    ListT.fromList = function(x) {
        return ListT(M.of(x));
    };
    ListT.fromArray = function(x) {
        return ListT(M.of(List.fromArray(x)));
    };

    return ListT;
};

// Export
if(typeof module != 'undefined')
    module.exports = List;
