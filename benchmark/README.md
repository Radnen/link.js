/benchmark
==========

I could not find a good place for benchmarking, so here you can run
the tests against Lazy and Lo-Dash, you'll notice for every case,
Link is the fastest.

However, the optimization process does take some time away from it doing work.
So to not muddle up the results, I cache the chain by doing this:

``` javascript
var link = Link(array).map(add1); //... and so on ...
```

Lazy can do the same thing. And is totally something you should do when using such libraries.
(I'm not sure about lo-dash). Anyways, this simply means I'm not taking time reconstructing
the chain each benchmarking pass. I think this is fair when we are trying to test the speed
of it doing the actual work.

That said, the speed of creating the chain isn't so bad. Perhaps if it optimizes
frequently it'll bog down. It should be on par with Lazy in any case. Plus, longer
chains means more work, so if you can shorten your chain then it only gets better.
