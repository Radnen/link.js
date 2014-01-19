/benchmark
==========

I could not find a good place for benchmarking, so here you can run
the tests against Lazy and Lo-Dash, you'll notice for every case,
Link is either the faster, or on par with Lazy.

The interactive test is located here:
http://radnen.tengudev.com/link-benchmark/

On my machine the speeds of the first test (map-filter-map-each) are
quite good, almost approaching native for-loop speed.

```
Link map-filter-map-each: 0.1900000000023283ms index.html:38
Lazy map-filter-map-each: 1.1200000000098953ms index.html:38
Lo-Dash map-filter-map-each: 4.499999999970896ms index.html:38
actual for loop: 0.18000000003667083ms index.html:38
Fastest is actual for loop
```

The code comparisons for that test:
``` javascript
var array = Lazy.range(100000).toArray();

// Link:
Link(array).map(add1).filter(even).map(add1).each(noop);

// Lazy:
Lazy(array).map(add1).filter(even).map(add1).each(noop);

// Lo-dash:
_.chain(array).map(add1).filter(even).map(add1).each(noop);

//For loop:
for (var i = 0; i < array.length; ++i) {
	var result = add1(array[i]);
	if (even(result)) noop(add1(result));
}
```
