/**
* Script: link.js
* Written by: Radnen
* Updated: 1/10/2014
**/

/***********
* Link.js is a very fast general-purpose functional programming library.
* Still highly experimental, and still under construction.
************

chainable:
	These can be linked up like a chain,
	ex: Link(array).map(add).filter(even).first().toArray();
	
	- take(n)               - take the first n results.
	- first(|fn)            - take first satisfying item, or if no function, the very first item.
	- map(fn)               - perform a map operation with fn.
	- filter(fn)            - perform a filter, using fn as the predicate.
	- filterBy(name, value) - filters out objects whose named property does not match the value.
	- reject(fn)            - perform the opposite of filter.
	- get(num)              - tries to get the indexed item.
	- uniq()                - filters the results to only unique items.
	- zip(array)            - combines the contents of the array with the current elements.
	- slice(a, b)           - returns results between [a, b).

non-chainable:
	These are non-chainable since they must perform the query first,
	but you can chain those that return an array by putting them into another Link context.
	ex: Link(Link(array).where(even).sample(5)).map(timesten).each(print);

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
	
*********/

// optimization idea came from compilation:
var Link = (function() {
	// when doing some actions, hold some contextual info.
	var Env = {
		stop: false,
		take: false,
	}
	
	/** Point Layer **/

	function WherePoint(fn, reject)
	{
		var where = fn;
		this.next;
		this.func = fn;
		if (reject)
			this.exec = function(item) { if (!where(item)) this.next.exec(item); }
		else
			this.exec = function(item) { if (where(item)) this.next.exec(item); }
	}
	
	function FilterByPoint(key, value) {
		var k = key, v = value;
		this.exec = function(item) { if (item[k] == v) this.next.exec(item); }
	}

	function MapPoint(fn)
	{
		var map = fn;
		this.next;
		this.func = fn;
		this.exec = function(item) { this.next.exec(map(item)); }
	}

	function Map2Point(fn1, fn2)
	{
		var map1 = fn1, map2 = fn2;
		this.next;
		this.exec = function(item) { this.next.exec(map2(map1(item))); }
	}

	function WhereMapPoint(fn1, fn2)
	{
		var where = fn1, map = fn2;
		this.next;
		this.exec = function(item) { if (where(item)) this.next.exec(map(item)); }
	}

	function MapWherePoint(fn1, fn2)
	{
		var where = fn2, map = fn1;
		this.next;
		this.exec = function(item) {
			var i = map(item);
			if (where(i)) this.next.exec(i);
		}
	}

	function Where2Point(fn1, fn2)
	{
		var wh1 = fn1, wh2 = fn2;
		this.next;
		this.exec = function(item) {
			if (wh1(item) && wh2(item)) this.next.exec(item);
		}
	}

	function ZipPoint(array) {
		var a = array, i = 0;
		this.exec = function(item) { this.next.exec([item, a[i++]]); }
	}
	
	function GroupByPoint(fn) {
		var a = {}, group = fn;
		this.exec = function(item) {
			var index = group(item);
			if (!a[index]) a[index] = [item];
			else a[index].push(item);
		}
		this.getGroup = function() { var o = a; a = {}; return o; }
	}

	function SlicePoint(index1, index2) {
		var a = index1, b = index2, i = 0;
		this.exec = function(item) { if (i >= b) Env.stop = true; else if (i >= a) this.next.exec(item); i++; }
	}

	function FirstPoint(fn)
	{
		var func = fn;
		this.next;
		if (func) {
			this.exec = function(item) {
				if (func(item)) Env.stop = true;
				this.next.exec(item);
			}
		}
		else {
			this.exec = function(item) {
				Env.stop = true;
				this.next.exec(item);
			}
		}
	}

	function GetPoint(num) {
		var n = num, c = 0;
		this.next;
		this.exec = function(item) {
			if (c == n) {
				Env.stop = true; c = 0;
				this.next.exec(item);
			} else c++;
		}
	}

	function ContainsPoint(o) {
		var obj = o;
		this.pass = false;
		if (typeof o == "function")
			this.exec = function(item) { if (obj(item)) this.pass = Env.stop = true; };
		else
			this.exec = function(item) { if (item == obj) this.pass = Env.stop = true; };
	}
	
	function EveryPoint(fn) {
		var func = fn;
		this.pass = true;
		this.exec = function(item) { if (!func(item)) { this.pass = false; Env.stop = true; } };
	}

	function IndexOfPoint(obj, value) {
		var o = obj, v = value, idx = -1, i = 0;
		
		if (typeof o == "function")
			this.exec = function(item) { idx++; if (o(item)) { i = idx; Env.stop = true; } };
		else if (v !== undefined)
			this.exec = function(item) { idx++; if (item[o] == v) { i = idx; Env.stop = true; } };
		else
			this.exec = function(item) { idx++; if (item == o) { i = idx; Env.stop = true; } };
			
		this.getIdx = function() { var v = idx != i ? -1 : i; i = 0; idx = -1; return v; };
	}

	function EachPoint(fn) {
		this.exec = fn;
	}
	
	function MaxPoint(fn, min) {
		var rank = fn, value = min ? Number.MAX_VALUE : Number.MIN_VALUE;
		if (min)
			this.exec = function(item) { if (rank(item) < value) value = item; }
		else
			this.exec = function(item) { if (rank(item) > value) value = item; }
		this.getValue = function() { var v = value; value = 0; return v; }
	}
	
	function InvokePoint(method, context) {
		var name = method, ctxt = context;
		if (method) {
			if (context)
				this.exec = function(item) { item[name].call(ctxt); }
			else
				this.exec = function(item) { item[name](); }
		}
		else if (context)
			this.exec = function(item) { item.call(ctxt); }
		else
			this.exec = function(item) { item(); }
	}

	function WhereEachPoint(f1, f2) {
		var where = f1, each = f2;
		this.exec = function(item) { if (where(item)) each(item); }
	}

	function TakePoint(size)
	{
		var i = 0, s = size;
		this.next;
		this.exec = function(item) {
			this.next.exec(item);
			if (++i == s) { Env.stop = true; i = 0; }
		}
	}

	function CountPoint(func)
	{
		var fn = func;
		this.counts = { num: 0, total: 0 };
		this.exec = function(item) { this.counts.total++; if (fn(item)) this.counts.num++; }
		this.getCount = function() { var c = this.counts; this.counts = { num: 0, total: 0 }; return c; }
	}

	function UniqPoint() // still experimental
	{
		var t = [];
		this.next;
		this.exec = function(item) { if (!t[item]) { t[item] = true; this.next.exec(item); } };
	}

	function LengthPoint() {
		var n = 0;
		this.exec = function() { n++; };
		this.num = function() { return n; }
	}

	function ReducePoint(fn, m) {
		var func = fn, memo = m, def = m;
		
		if (m !== undefined)
			this.exec = function(item) { memo = fn(memo, item); };
		else
			this.exec = function(item) {
				memo = def = item;
				this.exec = function(item) { memo = fn(memo, item); };
			}
		this.getMemo = function() { var v = memo; memo = def; return v; }
	}

	function AllPoint() {
		var i = 0, a = [];
		this.exec = function(item) { a[i++] = item; };
		this.getArray = function() { var arr = a; a = []; i = 0; return arr; };
	}
	
	var array, root, end, prev;

	function From(a) {
		Env.stop = false;
		Env.take = false;
		array = a;
		root = { next: null };
		end = root;
	}

	function PushPoint(point) {
		prev = end;
		end.next = point;
		end = point;
	}

	/** Functional Layer **/
	
	function Each(fn) {
		this.run(new EachPoint(fn));
		prev.next = null;
		end = prev;
	}
	
	function Run(point) {
		Env.stop = false;
		if (point) PushPoint(point);
		var a = array, l = a.length, i = 0, r = root.next, e = Env;
		if (e.take)
			while (i < l && !e.stop) r.exec(a[i++]);
		else
			while (i < l) r.exec(a[i++]);
	}
	
	function ToArray() {
		var point = new AllPoint();
		this.run(point);
		prev.next = null;
		end = prev;
		return point.getArray();
	}
	
	function Count(fn) {
		var point = new CountPoint(fn);
		this.run(point);
		return point.getCount();
	}
	
	function Length() {
		var point = new LengthPoint();
		this.run(point);
		return point.num();
	}
	
	function Contains(o) {
		Env.take = true;
		var point = new ContainsPoint(o);
		this.run(point);
		return point.pass;
	}
	
	function IndexOf(o, v) {
		Env.take = true;
		var point = new IndexOfPoint(o, v);
		this.run(point);
		return point.getIdx();
	}
	
	function GroupBy(fn) {
		var point = new GroupByPoint(fn);
		this.run(point);
		return point.getGroup();
	}
	
	function FilterBy(key, value) {
		PushPoint(new FilterByPoint(key, value));
		return this;
	}
	
	function Every(fn) {
		Env.take = true;
		var point = new EveryPoint(fn);
		this.run(point);
		return point.pass;
	}
	
	function Reduce(agg, memo) {
		var point = new ReducePoint(agg, memo);
		this.run(point);
		return point.getMemo();
	}
		
	function Sample(num) {
		if (!num) num = 1;
		Env.take = true;
		PushPoint(new SamplePoint(num));
		return this;
	}
		
	function Where(func) {
		if (end instanceof WherePoint) {
			var e = new Where2Point(end.func, func);
			prev.next = e;
			end = e;
		}
		else if (end instanceof MapPoint) {
			var e = new MapWherePoint(end.func, func);
			prev.next = e;
			end = e;
		}
		else
			PushPoint(new WherePoint(func));
		return this;
	}
	
	function Reject(func) {
		if (end instanceof WherePoint) {
			var e = new Where2Point(end.func, func, true);
			prev.next = e;
			end = e;
		}
		else if (end instanceof MapPoint) {
			var e = new MapWherePoint(end.func, func, true);
			prev.next = e;
			end = e;
		}
		else
			PushPoint(new WherePoint(func, true));
		return this;
	}
	
	function Map(func) {
		if (end instanceof WherePoint) {
			var e = new WhereMapPoint(end.func, func);
			prev.next = e;
			end = e;
		}
		else if (end instanceof MapPoint) {
			var e = new Map2Point(end.func, func);
			prev.next = e;
			end = e;
		}
		else
			PushPoint(new MapPoint(func));
		return this;
	}
	
	function Max(rank) {
		var point = new MaxPoint(rank);
		this.run(point);
		return point.getValue();
	}
	
	function Min(rank) {
		var point = new MaxPoint(rank, true);
		this.run(point);
		return point.getValue();
	}
	
	function Invoke(name, context) {
		this.run(new InvokePoint(name, context));
	}
	
	function First(fn) {
		Env.take = true;
		PushPoint(new FirstPoint(fn));
		return this;
	}
	
	function Zip(array) {
		PushPoint(new ZipPoint(array));
		return this;
	}
	
	function Slice(a, b) {
		if (a == 0) return this;
		Env.take = true;
		if (!b) b = Number.MAX_VALUE;
		PushPoint(new SlicePoint(a, b));
		return this;
	}
	
	function Last() {
		var a = this.toArray();
		return a[a.length - 1];
	}
	
	function Random(times) {
		if (times === undefined) times = 1;
		var a = this.toArray();
		var samples = [];
		while(times--) {
			var i = Math.floor(Math.random() * a.length);
			samples.push(a[i]);
			a.splice(i, 1);
		}
		return samples;
	}
	
	function Take(n) {
		Env.take = true;
		PushPoint(new TakePoint(n));
		return this;
	}
	
	function Get(num) {
		Env.take = true;
		if (num < 0) Env.stop = true;
		else if (num == 0)
			PushPoint(new FirstPoint());
		else
			PushPoint(new GetPoint(num));
		return this;
	}
	
	function Uniq() {
		PushPoint(new UniqPoint());
		return this;
	}
	
	function Sort(f) {
		var v = this.toArray();
		if (f) v.sort(f); else v.sort();
		return v;
	}
	
	/** Interface Layer **/
	
	return function(arr) {
		if (arr !== undefined) From(arr);
		
		return {
			pushPoint: PushPoint,
			each: Each,
			run: Run,
			where: Where,
			filter: Where,
			filterBy: FilterBy,
			whereBy: FilterBy,
			reject: Reject,
			map: Map,
			first: First,
			toArray: ToArray,
			count: Count,
			length: Length,
			size: Length,
			contains: Contains,
			invoke: Invoke,
			some: Contains,
			exists: Contains,
			indexOf: IndexOf,
			groupBy: GroupBy,
			every: Every,
			reduce: Reduce,
			zip: Zip,
			slice: Slice,
			sample: Sample,
			last: Last,
			random: Random,
			sample: Random,
			take: Take,
			get: Get,
			uniq: Uniq,
			unique: Uniq,
			sort: Sort,
			max: Max,
			min: Min
		}
	}
})();