/**
* Script: link.js
* Written by: Radnen
* Updated: 1/13/2014
**/

/**************
	VERSION 0.2.1
	
	Link.js is a very fast general-purpose functional programming library.
	Still highly experimental, and still under construction.

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
	"use strict";
	
	/** Point Layer **/

	function WherePoint(fn, reject) {
		this.next = null;
		this.env = null;
		this.func = fn;
	}
	
	WherePoint.prototype.exec = function(item) {
		if (this.func(item)) this.next.exec(item);
	}
	
	WherePoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { if (f(a[i])) n.exec(a[i]); }
		else
			while (++i < l) { if (f(a[i])) n.exec(a[i]); }
		return i;
	}

	function RejectPoint(fn, reject) {
		this.next = null;
		this.env = null;
		this.func = fn;
	}
	
	RejectPoint.prototype.exec = function(item) {
		if (!this.func(item)) this.next.exec(item);
	}
	
	RejectPoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { if (!f(a[i])) n.exec(a[i]); }
		else
			while (++i < l) { if (!f(a[i])) n.exec(a[i]); }
		return i;
	}
	
	function FilterByPoint(k, v) {
		this.next = null;
		this.env = null;
		this.key = k;
		this.val = v;
	}
	
	FilterByPoint.prototype.exec = function(item) {
		if (item[this.key] == this.val) this.next.exec(item);
	}
	
	FilterByPoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			k = this.key, v = this.val, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { if (item[k] == v) n.exec(a[i]); }
		else
			while (++i < l) { if (item[k] == v) n.exec(a[i]); }
		return i;
	}

	function MapPoint(fn) {
		this.next = null;
		this.env = null;
		this.func = fn;
	}
	
	MapPoint.prototype.exec = function(item) {
		this.next.exec(this.func(item));
	}
	
	MapPoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { n.exec(f(a[i])); }
		else
			while (++i < l) { n.exec(f(a[i])); }
		return i;
	}

	function Map2Point(fn1, fn2) {
		this.next = null;
		this.env = null;
		this.map1 = fn1;
		this.map2 = fn2;
	}
	
	Map2Point.prototype.exec = function(item) {
		this.next.exec(this.map2(this.map1(item)));
	}
	
	Map2Point.prototype.run = function() {
		var i = -1, l = a.length - 1, e = this.env,
			f1 = this.map1, f2 = this.map2, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { n.exec(f2(f1(a[i]))); }
		else
			while (++i < l) { n.exec(f2(f1(a[i]))); }
		return i;
	}

	function WhereMapPoint(fn1, fn2) {
		this.next = null;
		this.env = null;
		this.where = fn1;
		this.map = fn2;
	}
	
	WhereMapPoint.prototype.exec = function(item) {
		if (this.where(item)) this.next.exec(this.map(item));
	}
	
	WhereMapPoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			f1 = this.where, f2 = this.map, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) { if (f1(a[i])) n.exec(f2(a[i])); }
		else
			while (++i < l) { if (f1(a[i])) n.exec(f2(a[i])); }
		return i;
	}

	function MapWherePoint(fn1, fn2) {
		this.next = null;
		this.env = null;
		this.map = fn1;
		this.where = fn2;
	}
	
	MapWherePoint.prototype.exec = function(item) {
		var i = this.map(item);
		if (this.where(i)) this.next.exec(i);
	}

	MapWherePoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, e = this.env,
			f1 = this.where, f2 = this.map, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) {
				var v = f2(a[i]); if (f1(v)) n.exec(v);
			}
		else
			while (++i < l) {
				var v = f2(a[i]); if (f1(v)) n.exec(v);
			}
		return i;
	}

	function Where2Point(fn1, fn2) {
		this.next = null;
		this.env = null;
		this.where1 = fn1;
		this.where2 = fn2;
	}
	
	Where2Point.prototype.exec = function(item) {
		if (this.where1(item) && this.where2(item)) this.next.exec(item);
	}
	
	Where2Point.prototype.run = function() {
		var i = -1, l = a.length - 1, e = this.env;
			f1 = this.where1, f2 = this.where2, n = this.next;
		if (e.take)
			while (++i < l && !e.stop) {
				var v = a[i];
				if (f1(v) && f2(v)) n.exec(v);
			}
		else
			while (++i < l) {
				var v = a[i];
				if (f1(v) && f2(v)) n.exec(v);
			}
		return i;
	}

	function ZipPoint(array) { // experimental
		this.next = null;
		this.env = null;
		this.i = 0;
	}

	ZipPoint.prototype.exec = function(item) { this.next.exec([item, array[this.i++]]); }
	
	function GroupByPoint(groupFn) { // end point
		this.next = null;
		this.env = null;
		this.func = groupFn;
		this.group = {};
	}
	
	GroupByPoint.prototype.exec = function(item) {
		var index = this.func(item);
		if (!this.group[index]) this.group[index] = [item];
		else this.group[index].push(item);
	}

	function SlicePoint(a, b) {
		this.next = null;
		this.env = null;
		this.i = 0;
		this.a = a;
		this.b = b;
	}

	SlicePoint.prototype.exec = function(item) {
		if (this.i >= this.b) { this.env.stop = true; this.i = 0; return; }
		else if (this.i >= this.a) this.next.exec(item);
		this.i++;
	}
	
	function FirstFuncPoint(fn) {
		this.next = null;
		this.env = null;
		this.func = fn;
	}
	
	FirstFuncPoint.prototype.exec = function(item) {
		if (this.func(item)) { this.env.stop = true; this.next.exec(item); }
	}

	function FirstPoint() {
		this.next = null;
		this.env = null;
	}
	
	FirstPoint.prototype.exec = function(item) {
		this.env.stop = true;
		this.next.exec(item);
	}

	function GetPoint(n) {
		this.next = null;
		this.env = null;
		this.c = 0;
		this.n = n;
	}
	
	GetPoint.prototype.exec = function(item) {
		if (this.c == this.n) {
			this.env.stop = true; this.c = 0;
			this.next.exec(item);
		} else this.c++;
	}

	function ContainsFuncPoint(fn) { // end point
		this.next = null;
		this.env = null;
		this.func = fn;
		this.pass = false;
	}
	
	ContainsFuncPoint.prototype.exec = function(item) {
		if (this.func(item)) this.pass = this.env.stop = true;
	}

	function ContainsPoint(o) { // end point
		this.next = null;
		this.env = null;
		this.obj = o;
		this.pass = false;
	}
	
	ContainsPoint.prototype.exec = function(item) {
		if (item == this.obj) this.pass = this.env.stop = true;
	}
	
	function EveryPoint(func) { // end point
		this.next = null;
		this.env = null;
		this.pass = true;
		this.func = func;
	}

	EveryPoint.prototype.exec = function(item) {
		if (!this.func(item)) { this.pass = false; this.env.stop = true; }
	}

	function IndexOfPoint(v) { // end point
		this.next = null;
		this.env = null;
		this.value = v;
	}
	
	IndexOfPoint.prototype.exec = function(item) {
		if (item == this.value) this.env.stop = true;
	}

	function EachPoint(fn) { this.exec = fn; }
	
	function MinPoint(rank) { // end point
		this.next = null;
		this.env = null;
		this.func = rank;
		this.value = Number.MAX_VALUE;
		this.obj;
	}
	
	MinPoint.prototype.exec = function(item) {
		var v = this.func(item);
		if (v < this.value) { this.value = v; this.obj = item; }
	}

	function MaxPoint(rank) { // end point
		this.next = null;
		this.env = null;
		this.func = rank;
		this.value = Number.MIN_VALUE;
		this.obj;
	}

	MaxPoint.prototype.exec = function(item) {
		var v = this.func(item);
		if (v > this.value) { this.value = v; this.obj = item; }
	}
	
	function InvokePoint(method) { // end point
		this.next = null;
		this.env = null;
		this.name = method;
	}
	
	InvokePoint.prototype.exec = function(item) { item[this.name](); }
	
	InvokePoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1, n = this.name;
		while(++i < l) { a[i][n](); }
		return i;
	}

	function TakePoint(size) {
		this.next = null;
		this.env = null;
		this.i = 0;
		this.num = size;
	}
	
	TakePoint.prototype.exec = function(item) {
		this.next.exec(item);
		if (++this.i == this.num) { this.env.stop = true; this.i = 0; }
	}

	function CountPoint(func) { // end point
		this.next = null;
		this.env = null;
		this.func = func;
		this.counts = { num: 0, total: 0 };
	}
	
	CountPoint.prototype.exec = function(item) {
		this.counts.total++;
		if (this.func(item)) this.counts.num++;
	}

	function UniqPoint() { // still experimental
		this.next = null;
		this.env = null;
		this.set = [];
	}
	
	UniqPoint.prototype.exec = function(item) {
		if (!this.set[item]) { this.set[item] = true; this.next.exec(item); }
	}

	function LengthPoint() { // end point
		this.next = null;
		this.env = null;
		this.num = 0;
	}
	
	LengthPoint.prototype.exec = function(item) { this.num++; }

	function ReducePoint(fn, m) { // end point
		this.next = null;
		this.env = null;
		var func = fn, memo = m;
		
		if (m !== undefined)
			this.exec = function(item) { memo = fn(memo, item); };
		else
			this.exec = function(item) {
				memo = item;
				this.exec = function(item) { memo = fn(memo, item); };
			}
		this.getMemo = function() { return memo; }
	}

	function AllPoint(array) { // end point
		this.next = null;
		this.env = null;
		this.i = 0;
		this.array = [];
	}
	
	AllPoint.prototype.exec = function(item) { this.array[this.i++] = item; }
	
	AllPoint.prototype.run = function(a) {
		var i = -1, l = a.length - 1;
		while (++i < l) this.array.push(a[i]);
		return i;
	}
	
	/** Functional Layer **/

	function PushPoint(point) {
		point.env = this.env;
		var last  = this.points.length - 1;
		if (last >= 0) this.points[last].next = point;
		this.points.push(point);
	}
	
	function ReplaceEnd(point) {
		point.env = this.env;
		var last  = this.points.length - 1;
		this.points[last] = point;
		if (last > 0) this.points[last - 1].next = point;
	}
	
	function Each(fn) {
		this.run(new EachPoint(fn));
	}
	
	function FilterEach(where, func) {
		var point = new EachPoint(function(item) { if (where(item)) func(item); });
		this.run(point);
	}
	
	function Run(point) {
		this.env.stop = false;
		if (point) this.pushPoint(point);
		var start = this.points[0];
		if (start.run) {
			this.env.index = start.run(this.target, this.points);
		}
		else {
			var a = this.target, l = a.length - 1, i = -1, e = this.env;
			if (e.take)
				while (++i < l && !e.stop) start.exec(a[i]);
			else
				while (++i < l) start.exec(a[i]);
			this.env.index = i;
		}
		this.points.length--;
	}
	
	function ToArray() {
		var point = new AllPoint();
		this.run(point);
		return point.array;
	}
	
	function Count(fn) {
		var point = new CountPoint(fn);
		this.run(point);
		return point.counts;
	}
	
	function Length() {
		var point = new LengthPoint();
		this.run(point);
		return point.num;
	}
	
	function Contains(o) {
		this.env.take = true;
		var point;
		if (typeof o == "function")
			point = new ContainsFuncPoint(o);
		else
			point = new ContainsPoint(o);
		this.run(point);
		return point.pass;
	}
	
	function IndexOf(o) {
		this.env.take = true;
		var point = new IndexOfPoint(o);
		this.run(point);
		return this.env.index - 1;
	}
	
	function GroupBy(fn) {
		var point = new GroupByPoint(fn);
		this.run(point);
		return point.group;
	}
	
	function FilterBy(key, value) {
		this.pushPoint(new FilterByPoint(key, value));
		return this;
	}
	
	function Every(fn) {
		this.env.take = true;
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
		this.env.take = true;
		this.pushPoint(new SamplePoint(num));
		return this;
	}
		
	function Where(func) {
		var last = this.points[this.points.length - 1];
		if (last instanceof WherePoint)
			this.replaceEnd(new Where2Point(last.func, func));
		else if (last instanceof MapPoint)
			this.replaceEnd(new MapWherePoint(last.func, func));
		else
			this.pushPoint(new WherePoint(func));
		return this;
	}
	
	function Reject(func) {
		this.pushPoint(new RejectPoint(func));
		return this;
	}
	
	function Map(func) {
		var last = this.points[this.points.length - 1];
		if (last instanceof WherePoint)
			this.replaceEnd(new WhereMapPoint(last.func, func));
		else if (last instanceof MapPoint)
			this.replaceEnd(new Map2Point(last.func, func));
		else
			this.pushPoint(new MapPoint(func));
		return this;
	}
	
	function Max(rank) {
		var point = new MaxPoint(rank);
		this.run(point);
		return point.obj;
	}
	
	function Min(rank) {
		var point = new MinPoint(rank);
		this.run(point);
		return point.obj;
	}
	
	function Invoke(name, context) {
		this.run(new InvokePoint(name, context));
	}
	
	function First(fn) {
		this.env.take = true;
		if (fn)
			this.pushPoint(new FirstFuncPoint(fn));
		else
			this.pushPoint(new FirstPoint());
		return this;
	}
	
	function Zip(array) {
		this.pushPoint(new ZipPoint(array));
		return this;
	}
	
	function Slice(a, b) {
		if (a == 0) return this;
		this.env.take = true;
		if (!b) b = Number.MAX_VALUE;
		this.pushPoint(new SlicePoint(a, b));
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
		this.env.take = true;
		this.pushPoint(new TakePoint(n));
		return this;
	}
	
	function Get(num) {
		this.env.take = true;
		if (num < 0) Env.stop = true;
		else if (num == 0)
			this.pushPoint(new FirstPoint());
		else
			this.pushPoint(new GetPoint(num));
		return this;
	}
	
	function Uniq() {
		this.pushPoint(new UniqPoint());
		return this;
	}
	
	function Sort(f) {
		var v = this.toArray();
		if (f) v.sort(f); else v.sort();
		return v;
	}
	
	/** Interface Layer **/
	
	function Chain(array) {
		this.env    = { take: false, stop: false, index: 0 };
		this.target = array || [];
		this.points = [];
	}
	
	Chain.prototype = {
		pushPoint: PushPoint,
		replaceEnd: ReplaceEnd,
		each: Each,
		run: Run,
		where: Where,
		filter: Where,
		filterEach: FilterEach,
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
	
	return function(arr) { return new Chain(arr); }
})();