link.js
=======

Link.js is a very fast general-purpose functional programming library.

Link uses Lazy execution (also called deferred execution) to produce its results.
That means things aren't being calculated until only when you need them. This offers
a large speed boost and a shallow memory footprint.

How does Link.js compare to similar libraries? See /benchmark for tests. It is already much
faster than Lazy and Lo-Dash, which are the two main libraries tested against.

It also has some built-in optimizations that leverage your work to try and do two things
at once so-to-speak (see: how it works).

Link is still a work in progress. It's API is already mostly usable, but still under construction.

How it Works
============

Link creates an abstract syntax tree (more like a chain than a tree) and runs an interpreter on it. The syntax in
question are methods like map, filter and each - those that do work to the underlying data. Each node in this
tree/chain whether it is a map node or a filter node, have an exec() method that does the work. The chain has the
ability to return early and the ability to go forward when needed. This also reduces overall memory usage.

It has an optimizer:

``` javascript
var results = Link(array).map(add).map(timesten).where(even).map(add).toArray()
```

turns into a different expression behind-the-scenes:

``` javascript
var results = Link(array).map2(add, timesten).wheremap(even, add).toArray()
```

Which turns out to greatly impact the overall execution speed of the library. Presently it knows to do this only
on a few operations (map and filter/where), but in time will grow as needed. The optimizer also takes some time to
work. The optimizer is ran while the chain is built. It is not a thing that runs on its own before the chain is
executed. The time it takes to create the chain severely reduces it's execution speed in a loop, so I suggest to
create the chain outside of intense loops to maximize performance. (See: /benchmark for details.)

Features
========

Link supports many features common to libraries similar to it.
This part is still under construction. Expect the ones listed here to work well enough,
especially  the popular ones. Many of them have several names. Where and Filter do the same
thing as does Unique and Uniq. So it can be close to a drop-in replacement of your other
favorite functional logic libraries.

Chainable:
----------

These can be linked up like a chain, ex:

``` javascript
var results = Link(array).map(add).filter(even).first().toArray();
```

- take(n) - take the first n results.
- first(|fn) - take first satisfying item, or if no function, the very first item.
- map(fn) - perform a map operation with fn.
- filter(fn) - perform a filter, using fn as the predicate.
- filterBy(name, value) - filters out objects whose named property does not match the value.
- reject(fn) - perform the opposite of filter.
- get(num) - tries to get the indexed item.
- uniq() - filters the results to only unique items.
- zip(array) - combines the contents of the array with the current elements.
- slice(a, b) - returns results between [a, b).

Non-Chainable:
--------------

These are non-chainable since they must perform the query first, but you can chain those
that return an array by putting them into another Link context. ex:

``` javascript
var results = Link(Link(array).where(even).sample(5)).map(timesten).each(print);
```

- each(fn) - runs the results through the given function.
- invoke(method) - runs the results, invoking the named method.
- toArray() - returns an array.
- contains(o|p) - returns true if something satisfies the predicate or matches the object.
- some(o|p) - returns true if something satisfies the predicate or matches the object.
- indexOf(o) - returns -1 if item not found, or the index.
- every(fn) - checks to see if all items satisfy the predicate.
- reduce(fn, memo) - reduces the results, starting at memo, or if not, the first item.
- length() - returns the overall length.
- count(p) - returns the overall number of times the predicate was satisfied.
- min(rank) - returns the minimum element using a ranking function as a benchmark.
- max(rank) - returns the maximum element using a ranking function as a benchmark.
- last() - returns the last result.
- sample(num) - selects a random element, up to num of them or once.
- sort(fn) - sorts the resulting list with given function, or uses JS default.
- groupBy(fn) - returns an array of values grouped by the grouping function.

Planned Features
================

- Make Link return a link object. A chain you can keep around and do work with later.
- Add more features common to Lazy/Underscore
- Make it web friendlier (Node support, etc).
- Find ways of creating a light-weight non-optimized version.