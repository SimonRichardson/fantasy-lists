# Fantasy List

This library implements purely functional, monadic homogenous list 
data structure.

```javavscript
var a = List.from(0, Number.MAX_VALUE);
a.take(0, 10); // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
```

Because Fantasy lists are lazy, it won't try to evaluate the possible
infinite list immediately because it would never finish. It'll wait to 
see what you want to get out of that infinite lists.

(Note: `take` isn't currently implemented)

## Fantasy Land Compatible

[
  ![](https://raw.github.com/fantasyland/fantasy-land/master/logo.png)
](https://github.com/fantasyland/fantasy-land)
