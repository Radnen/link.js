/benchmark
==========

I could not find a good place for benchmarking, so here you can run
the tests against Lazy and Lo-Dash, you'll notice for every case,
Link is the fastest.

But I am cheating... a bit.

In fact, Link is the slowest performer of all of them! It has a lot
to do with it's chain generation. The optimization process takes
quite some time away from it doing work. So, I cache the chain by 
doing this:

``` javascript
var link = Link(array).map(add1); //... and so on ...
```

Lazy can do the same thing. I'm not sure about lo-dash. Anyways,
this simply means I'm not taking time reconstructing the chain each
benchmarking pass. I think this is fair when we are trying to test
the speed of it doing the real work.

Can I make link any faster... Why is it so slow? Well, I guess Link is more
designed for you to create the chain early and only run it later, which is
a core design principle of lazy evaluation. See, I think you can spend all
the time in the world generating what you want link to do before running it.
Of course, it does depend on how time-critical where you want it to run. It
might not be the best option for you.

Presently doing the above is not so feasible in the current version of Link
since a second query will obliterate the first. This will change as progress
is made.
