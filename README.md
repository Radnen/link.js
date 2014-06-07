Link.js
=======

Version: 0.2.15

Link.js is a very fast general-purpose functional programming library.

Link uses Lazy execution (also called deferred execution) to produce its results.
That means things aren't being calculated until only when you need them. This offers
a large speed boost and a shallow memory footprint.

How does Link.js compare to similar libraries? See /benchmark for tests. It is already much
faster than Lazy and Lo-Dash, which are the two main libraries tested against. You can run the
benchmarks yourself by visiting: http://radnen.tengudev.com/link-benchmark/

It also has some built-in optimizations that leverage your work to try and do two things
at once so-to-speak (see: how it works).

Link is still a work in progress. It's API is already mostly usable, but still under construction.

Examples
========

Link's main purpose is to do work on arrays, whether it is arrays of objects or primitives. When you want to do
some kind of filtering, you may be tempted to write out the for loop each time you want to do something different.
In the case of libraries like Link.js, Lazy.js or Underscore.js, you can do those filterings and mappings more
efficiently by lifting all of the heavy for-loop work for you.

Grabbing all even numbers:
``` javascript
function even(item) { return item % 2 == 0; }
var evens = Link([1, 2, 3, 4, 5]).filter(even).toArray();
```

Finding the index of a particular object:
``` javacript
var list = [{ name: "Bob" }, { name: "Joe" }, { name: "Tom" }, { name: "Ann" }, { name: "Sue" }];
var index = Link(list).indexOf("name", "Ann");
```

Filtering unique elements is interesting, unlike other libraries Link cannot subscribe itself to a particular uniqueness method.
You may want a lightweight, and fast checker or a powerful deep-inspection checker. So, I leave it up to you. You may like to
know it will always filter out primitives very fast (strings, numbers, boolean). On objects it may not know how to proceed.
So, here is an example of how to filter out items which are unique on a first-level basis:

``` javascript
function filter_shallow(item, other) {
    for (var i in item) {
		if (item[i] != other[i]) return false;
    }
    return true;
}

Link([{x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}]).uniq(filter_shallow).toArray();

// produces: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}]
```

On more complex data, the above may not be good enough, but certainly is a fast way of doing it for smaller chunks of data. Now,
if you do not specify a uniqueness checker, it'll default to checking the object references instead, which may not be
a bad idea sometimes:

``` javascript
function point(x, y) { this.x = x; this.y = y; }

var zero = new point(0, 0);
var ones = new point(1, 1);
var other = new point(0, 1);

Link([ones, ones, zero, other, zero, other, ones, ones]).uniq().toArray();

// produces: [ones, zero, other]
```

Ok... so Here's a lot of work:
``` javascript
Link(numbers).map(addRandom).filter(even).unique().each(function(item) { console.log(item); });
```

To write the above in a for loop, you may write a lot more code than you need. For example, finding the unique element
in the list would need a special library or is tedious each time you write a for loop that uses such a thing. Then, if
you did write the for loop there is a chance you got something wrong. ;)

You can also use contains and filterBy on multiple values for one-many relationships. It does an or-based check:
```
var people = [{ name: "bob", age: 25 }, { name: "sally", age: 24 }, { name: "steve", age: 21 }]
Link(people).filterBy("name", ["bob", "sally"]).pluck("age").toArray() // [25, 24];
Link(people).filterBy("name", "sally").pluck("age").toArray() // [24];

var numbers = [0, 1, 2, 3, 4];
Link(numbers).contains(4) // true
Link(numbers).contains([5, 3]) // true because of the '3' in the list
Link(numbers).contains([5, 6, 7, 8]) // false
```

How it Works
============

Link creates an abstract syntax list and only when you make it do work does it interpret that list. The syntax in
question are methods like map, filter, and each - those that do work to the underlying data. Each node in this
chain whether it is a map node or a filter node, have an exec() method that does the work. The chain has the
ability to return early and the ability to go forward when needed. This also reduces overall memory usage.

It has the ability to optimize:

``` javascript
var results = Link(array).map(add).map(timesten).where(even).map(add).toArray()
```

turns into a different expression behind-the-scenes:

``` javascript
var results = Link(array).map2(add, timesten).wheremap(even, add).toArray()
```

Which turns out to greatly impact the overall execution speed of the library. Presently it knows to do this only
on a few operations (map and filter/where), but in time will grow as needed. Optimization also takes some time to
work. Optimization happens as the chain is built. It is not a thing that runs on its own before the chain is
executed. The time it takes to create the chain somewhat reduces it's execution speed in a loop, so I suggest to
create the chain outside of intense loops to maximize performance. (See: /benchmark for details.)

It further gets a speed increase on nodes that have a run() method on them. If it does, it'll 'kickstart' the
query and produce results faster by "inlining" it's own operations. This is very noticeable on queries that
start with filter() or map(). But there is a caveat: it is time consuming on my end to write these cases in.
I'll need to study how I can automatically generate these runners as needed, presently there are only a few.

Features
========

Link supports many features common to libraries similar to it. This part is still under construction. Expect the
ones listed here to work well enough, especially  the popular ones. Many of them have several names. Where and
Filter do the same thing as does Unique and Uniq. So it can be close to a drop-in replacement of your other
favorite functional logic libraries.

Multi-Dimensional Expansion
---------------------------

Via the .expand() or .unroll() method, Link will branch out and run all sub-arrays. Here is an example running Link on
a 2D array.
``` javascript
	var a = [[0, 1], [2, 3], [4, 5, 7], [6, 7]];
	var s = Link(a).expand().filter(even).toArray(); // s = [0, 2, 4, 6]
```

Calling .expand() multiple times can accommodate 3D arrays and so on. A word of warning, however: Link will continue
to run the query as if it were in a single array context. Therefore things like .indexOf() will presently give you the
real index value of the item, not the index of the item in its containing array. This really only affects a few methods.
Methods like .each() and .invoke() should work just as you expect them to (but now expanded to run child arrays).

Furthermore, expand can expand into properties of arrays of objects like so:
``` javascript
var a = [{a: [0, 1]}, {a: [2]}, {a: [3, 4, 5]}, {a: [6, 7]}];
var s = Link(a).expand("a").filter(even).toArray(); // s = [0, 2, 4, 6];

// the same as doing:
var s = Link(a).pluck("a").expand().filter(even).toArray(); // s = [0, 2, 4, 6];
```

It now supports this ability through the main argument list:
``` javascript
var list = Link(a1, a2, a3).toArray();

// the same as doing:
var list = Link([a1, a2, a3]).expand().toArray();
```

Multi-Dimensional Array Initialization
--------------------------------------

Via Link.create(..., value), you can construct n-dimensional arrays in a snap filled with a default value. Here's an example:
``` javascript
// a 10x5 array filled with 0's:
var array = Link.create(10, 5, 0);
```
Sometimes you want to fill an array with objects, let's do that for a 3 dimensional array:
``` javascript
// a 2x2x6 array with new items in each slot:
var array = Link.create(2, 2, 6, function() { return new Item(); });
```
Notice that the first n-1 arguments defines the rank, and the last argument defines the 'fill'. If the fill is not a function
it'll fill the resulting n-dimensional array with the object. If it's a function it'll run that function. The function does
receive a parameter: an index value so you *could* do some work with it as you fill the array.
``` javascript
// a 2x3 array: [[0,1,2][0,1,2]]
var array = Link.create(2, 3, function(n) { return n; });
```
Inside of the function for array generation you have n arguments, each argument the current index into that dimension of the array.

SQL-like API
------------
If you don't want to use a full-on database system, you *could* use Link to do SQL-like actions to
arrays of objects. This works similar in theory to ojbect-relational approaches found in most SQL-
like JS implementations: rows are array entires and columns are object properties.
``` javascript
Link(grades_table).where('name', 'bob').update('grade', 'A');
```
So, if you don't need a full-on database system, you could use Link to give you the feel of using
a database without resorting to a DBMS.

In this example we get the grades of all people whose name starts with 'b':
``` javascript
Link(grades_table).where(function(item) { return item.name[0] == 'b'; }).select('name', 'grade').toArray();
```
Since Link is not a database implementation, the only caveat is that you should think of your SQL-like
queries backwards. Do the 'selects' last, and the 'wheres' first. Here is a join (only inner so far):
``` javascript
Link(data1).join(data2, function(a, b) { return a.id == b.id }).select("name", "date").toArray();
```

Aliases!
--------
If you don't like the API, then forget about it! (well... sort of). You can decide to recast any of the
existing features to something new. For example, you can decide to recast 'filter' to 'include' by doing this:
``` javascript
Link.alias('filter', 'include');
```

Chainable:
----------

These can be linked up like a chain, ex:

``` javascript
var results = Link(array).map(add).filter(even).first().toArray();
```

*	expand(|prop)     - expands Link to use inner arrays, or if prop is specified arrays in prop. 
	*	expandInto(prop)
	*	unroll()
*	filter(fn)        - perform a filter, using fn as the predicate.
	*	accept(fn)
	*	where(fn)
*	filterBy(name, v|a) - filters out objects whose named property does not match the value or array of values.
	*	whereBy(name, v|a)
	*	where(name, v) - (overload on 'where' for this style)
	*	filter(name, v) - (alias for overload)
	*	accept(name, v) - (alias for overload)
*	first(c)          - takes the first c items.
*	has(p, v|fn)      - filters out objects whose inner arrays don't contain the value or matches the predicate.
*	is(instance)      - filters out items that are not of the prototype.
*	join(other, func) - joins the context array with 'other' based on the condition function.
*	map(fn)           - perform a map operation with fn.
*	pluck(prop)       - continues the chain using the object property named 'prop'.
*	reject(fn)        - perform the opposite of filter.
*	skip(num)         - skips first 'num' elements.
	*	drop(num)
*	slice(a, b)       - returns results between [a, b).
*	select(...)       - filters out props of all objects to only the listed ones.
*	take(n)           - takes the first n results.
*	type(type)        - filters out items that are not of the type.
	*	typeof(type)
*	uniq(test)        - filters the results to only unique items. May also use a uniqueness test on objects.
	*	unique(test)
*	zip(array)        - combines the contents of the array with the current elements.

Non-Chainable:
--------------

These are non-chainable since they must perform the query first, but you can chain those
that return an array by putting them into another Link context. ex:

``` javascript
var results = Link(Link(array).where(even).sample(5)).map(timesten).each(print);
```

*	contains(o|p|a)  - returns true if something satisfies the predicate, or matches the object or anything in an array.
	*	some(o|p|a)
	*	exists(o|p|a)
*	count(p)         - returns the overall number of times the predicate ''p'' was satisfied.
*	each(fn)         - runs the results through the given function.
*	every(fn)        - checks to see if all items satisfy the predicate.
*	first(|fn)       - returns the first item, or the first that passes ''fn''.
*	get(num)         - tries to get the indexed item.
*	groupBy(fn)      - returns an array of values grouped by the grouping function.
*	indexOf(p|v)     - returns -1 if item p is not found, or prop p != v, or the index.
*	invoke(m, args)  - runs the results, invoking the method named by ''m''.
*	last()           - returns the last result.
*	length()         - returns the overall length.
	*	size()
*	max(rank)        - returns the maximum element using a ranking function as a benchmark.
*	min(rank)        - returns the minimum element using a ranking function as a benchmark.
*	none(fn)         - checks to see if all items do not satisfy the predicate ''fn''.
*	reduce(fn, memo) - reduces the results, starting at memo, or if not, the first item.
*	sample(num)      - selects a random element, up to ''num'' of them or once.
	*	random(num)
*	sort(fn)         - sorts the resulting list with given function, or uses JS default.
*	toArray()        - returns an array.
*	update(prop, v)  - changes the property value in the object to the value, best used with where.

Global
------

*	Link.create(..., fill) - creates multi-dimension arrays filed with the fill. If the fill is a function it calls it each time.
The functions takes n parameters, each the current index of the array.
*	Link.range(value) - creates a single array filled with numbers [0, range).
*	Link.alias(from, to) - realiases a method from one name to another (it doesn't overwrite, it creates).

Planned Features
================

- Create an official API page (perhaps in the wiki)
- Add more features common to Lazy/Underscore
- Find a decent way to generate 'runners'
- Make it web friendlier (Node support, etc)
