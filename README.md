link
====

Link.js is a very fast general-purpose functional programming library.

Link uses Lazy execution (also called deferred execution) to produce it's results.
That means things aren't being calculated until only when you need them. This offers
a large speed boost and a shallow memory footprint.

How does Link.js compare to other similar libraries? Well... how does 7 times faster sound?
It also has some built-in optimizations that leverage your work to try and do two things
at once so-to-speak.

How it Works
============

Link creates an abstract syntax tree and runs an interpreter on it. It could just create
the underlying for loop logic and run eval(), but eval is a nasty, evil construct. So, it
just interprets the chain. Values that survive to the end only ever get executed.

It has an optimizer:

`Link(array).map(add).map(timesten).where(even).map(add).toArray()`

turns into a different expression behind-the-scenes:

`Link(array).map2(add, timesten).wheremap(even, add).toArray()`

which turns out to greatly impact the overall execution speed of the library.

Features
========

Link supports many features common to libraries similar to it.
This part is still under construction. Expect the ones listed here to work well enough,
especially  the popular ones. Many of them have several names. Where and Filter do the same
thing as does Unique and Uniq. So it can be close to a drop-in replacement of your other
favorite functional logic libraries.

Chainable:
----------

	These can be linked up like a chain,
	ex: `Link(array).map(add).filter(even).first().toArray();`
	
	- take(n)     - take the first n results.
	- first(|fn)  - take first satisfying item, or if no function, the very first item.
	- map(fn)     - perform a map operation with fn.
	- filter(fn)  - perform a filter, using fn as the predicate.
	- reject(fn)  - perform the opposite of filter.
	- get(num)    - tries to get the indexed item.
	- uniq()      - filters the results to only unique items.
	- zip(array)  - combines the contents of the array with the current elements.
	- slice(a, b) - returns results between [a, b).

Non-Chainable:
--------------

These are non-chainable since they must perform the query first, but you can chain those
that return an array by putting them into another Link context.
ex: `Link(Link(array).where(even).sample(5)).map(timesten).each(print);`

- each(fn)         - runs the results through the given function.
- invoke(method)   - runs the results, invoking the named method.
- toArray()        - returns an array.
- contains(o|p)    - returns true if something satisfies the predicate or matches the object.
- some(o|p)        - returns true if something satisfies the predicate or matches the object.
- indexOf(o)       - returns -1 if item not found, or the index.
- every(fn)        - checks to see if all items satisfy the predicate.
- reduce(fn, memo) - reduces the results, starting at memo, or if not, the first item.
- length()         - returns the overall length.
- count(p)         - returns the overall number of times the predicate was satisfied.
- min(rank)        - returns the minimum element using a ranking function as a benchmark.
- max(rank)        - returns the maximum element using a ranking function as a benchmark.
- last()           - returns the last result.
- sample(num)      - selects a random element, up to num of them or once.
- sort(fn)         - sorts the resulting list with given function, or uses JS default.
- groupBy(fn)      - returns an array of values grouped by the grouping function.
