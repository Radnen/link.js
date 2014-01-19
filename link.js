/**
* Script: link.js
* Written by: Radnen
* Updated: 1/18/2014
* Version: 0.2.5
* Desc: Link.js is a very fast general-purpose functional programming library.
		Still highly experimental, and still under construction.
**/

// optimization idea came from compilation:
var Link = (function() {
	"use strict";
	
	/** Point Layer **/

	function WherePoint(fn, reject) {
		this.next = null;
		this.env  = null;
		this.func = fn;
	}
	
	WherePoint.prototype.exec = function(item) {
		if (this.func(item)) this.next.exec(item);
	}
	
	WherePoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (f(a[i])) n.exec(a[i]); i++; }
		else
			while (i < l) { if (f(a[i])) n.exec(a[i]); i++; }
	}

	function RejectPoint(fn, reject) {
		this.next = null;
		this.env  = null;
		this.func = fn;
	}
	
	RejectPoint.prototype.exec = function(item) {
		if (!this.func(item)) this.next.exec(item);
	}
	
	RejectPoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (!f(a[i])) n.exec(a[i]); i++; }
		else
			while (i < l) { if (!f(a[i])) n.exec(a[i]); i++; }
	}
	
	function FilterByPoint(k, v) {
		this.next = null;
		this.env  = null;
		this.key  = k;
		this.val  = v;
	}
	
	FilterByPoint.prototype.exec = function(item) {
		if (item[this.key] == this.val) this.next.exec(item);
	}
	
	FilterByPoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			k = this.key, v = this.val, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (a[i][k] == v) n.exec(a[i]); i++; }
		else
			while (i < l) { if (a[i][k] == v) n.exec(a[i]); i++; }
	}

	function MapPoint(fn) {
		this.next = null;
		this.env  = null;
		this.func = fn;
	}
	
	MapPoint.prototype.exec = function(item) {
		this.next.exec(this.func(item));
	}
	
	MapPoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f = this.func, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { n.exec(f(a[i])); i++; }
		else
			while (i < l) { n.exec(f(a[i])); i++; }
	}

	function Map2Point(fn1, fn2) {
		this.next = null;
		this.env  = null;
		this.map1 = fn1;
		this.map2 = fn2;
	}
	
	Map2Point.prototype.exec = function(item) {
		this.next.exec(this.map2(this.map1(item)));
	}
	
	Map2Point.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f1 = this.map1, f2 = this.map2, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { n.exec(f2(f1(a[i]))); i++; }
		else
			while (i < l) { n.exec(f2(f1(a[i]))); i++; }
	}

	function WhereMapPoint(fn1, fn2) {
		this.next  = null;
		this.env   = null;
		this.where = fn1;
		this.map   = fn2;
	}
	
	WhereMapPoint.prototype.exec = function(item) {
		if (this.where(item)) this.next.exec(this.map(item));
	}
	
	WhereMapPoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f1 = this.where, f2 = this.map, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (f1(a[i])) n.exec(f2(a[i])); i++; }
		else
			while (i < l) { if (f1(a[i])) n.exec(f2(a[i])); i++; }
	}

	function MapWherePoint(fn1, fn2) {
		this.next  = null;
		this.env   = null;
		this.map   = fn1;
		this.where = fn2;
	}
	
	MapWherePoint.prototype.exec = function(item) {
		var i = this.map(item);
		if (this.where(i)) this.next.exec(i);
	}

	MapWherePoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			f1 = this.where, f2 = this.map, n = this.next;
		if (e.take)
			while (i < l && !e.stop) {
				var v = f2(a[i]); if (f1(v)) n.exec(v); i++;
			}
		else
			while (i < l) {
				var v = f2(a[i]); if (f1(v)) n.exec(v); i++;
			}
	}

	function Where2Point(fn1, fn2) {
		this.next   = null;
		this.env    = null;
		this.where1 = fn1;
		this.where2 = fn2;
	}
	
	Where2Point.prototype.exec = function(item) {
		if (this.where1(item) && this.where2(item)) this.next.exec(item);
	}
	
	Where2Point.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env;
			f1 = this.where1, f2 = this.where2, n = this.next;
		if (e.take)
			while (i < l && !e.stop) {
				var v = a[i];
				if (f1(v) && f2(v)) n.exec(v); i++;
			}
		else
			while (i < l) {
				var v = a[i];
				if (f1(v) && f2(v)) n.exec(v); i++;
			}
		return i;
	}

	function ZipPoint(array) { // experimental
		this.next = null;
		this.env  = null;
		this.i    = 0;
	}

	ZipPoint.prototype.exec = function(item) { this.next.exec([item, array[this.i++]]); }
	
	function GroupByPoint(groupFn) { // end point
		this.next  = null;
		this.env   = null;
		this.func  = groupFn;
		this.group = {};
	}
	
	GroupByPoint.prototype.exec = function(item) {
		var index = this.func(item);
		if (!this.group[index]) this.group[index] = [item];
		else this.group[index].push(item);
	}

	function SlicePoint(a, b) {
		this.next = null;
		this.env  = null;
		this.i    = 0;
		this.a    = a;
		this.b    = b;
	}

	SlicePoint.prototype.exec = function(item) {
		if (this.i >= this.b) { this.env.stop = true; this.i = 0; return; }
		else if (this.i >= this.a) this.next.exec(item);
		this.i++;
	}
	
	function FirstFuncPoint(fn) {
		this.next = null;
		this.env  = null;
		this.func = fn;
	}
	
	FirstFuncPoint.prototype.exec = function(item) {
		if (this.func(item)) { this.env.stop = true; this.next.exec(item); }
	}

	function FirstPoint() {
		this.next = null;
		this.env  = null;
	}
	
	FirstPoint.prototype.exec = function(item) {
		this.env.stop = true;
		this.next.exec(item);
	}
	
	function FirstCountPoint(num) {
		this.next = null;
		this.env  = null;
		this.num  = num;
		this.i    = 0;
	}
	
	FirstCountPoint.prototype.exec = function(item) {
		if (++this.i == this.num) this.env.stop = true;
		this.next.exec(item);
	}
	
	function IsPoint(inst) {
		this.next = null;
		this.env  = null;
		this.inst = inst;
	}
	
	IsPoint.prototype.exec = function(item) { if (item instanceof this.inst) this.next.exec(item); }
	
	IsPoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			ins = this.inst, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (a[i] instanceof ins) n.exec(a[i]); i++; }
		else
			while (i < l) { if (a[i] instanceof ins) n.exec(a[i]); i++; }
	}
	
	function TypePoint(type) {
		this.next = null;
		this.env  = null;
		this.type = type;
	}
	
	TypePoint.prototype.exec = function(item) { if (typeof item == this.type) this.next.exec(item); }
	
	TypePoint.prototype.run = function(a) {
		var i = 0, l = a.length, e = this.env,
			t = this.type, n = this.next;
		if (e.take)
			while (i < l && !e.stop) { if (typeof a[i] == t) n.exec(a[i]); i++; }
		else
			while (i < l) { if (typeof a[i] == t) n.exec(a[i]); i++; }
	}
	
	function SkipPoint(n) {
		this.next = null;
		this.env  = null;
		this.n    = n;
	}
	
	SkipPoint.prototype.exec = function(item) {
		if (this.env.skip == this.n) { this.next.exec(item); }
		else this.env.skip++;
	}	

	function GetPoint(n) {
		this.next = null;
		this.env  = null;
		this.c    = 0;
		this.n    = n;
	}
	
	GetPoint.prototype.exec = function(item) {
		if (this.c == this.n) {
			this.env.stop = true;
			this.next.exec(item);
		} this.c++;
	}

	function ContainsFuncPoint(fn) { // end point
		this.next = null;
		this.env  = null;
		this.func = fn;
		this.pass = false;
	}
	
	ContainsFuncPoint.prototype.exec = function(item) {
		if (this.func(item)) this.pass = this.env.stop = true;
	}

	function ContainsPoint(o) { // end point
		this.next = null;
		this.env  = null;
		this.obj  = o;
		this.pass = false;
	}
	
	ContainsPoint.prototype.exec = function(item) {
		if (item == this.obj) this.pass = this.env.stop = true;
	}
	
	function EveryPoint(func) { // end point
		this.next = null;
		this.env  = null;
		this.pass = true;
		this.func = func;
	}

	EveryPoint.prototype.exec = function(item) {
		if (!this.func(item)) { this.pass = false; this.env.stop = true; }
	}

	function IndexOfPoint(v) { // end point
		this.next  = null;
		this.env   = null;
		this.value = v;
		this.index = 0;
		this.found = false;
	}
	
	IndexOfPoint.prototype.exec = function(item) {
		if (item == this.value) this.env.stop = this.found = true;
		else this.index++;
	}

	IndexOfPoint.prototype.run = function(a) {
		var i = 0, l = a.length, v = this.value, n = this.next;
		while (i < l) { if (a[i] == v) { this.index = i; this.found = true; break; } else i++; }
	}

	function IndexOfPropPoint(p, v) { // end point
		this.next  = null;
		this.env   = null;
		this.prop  = p;
		this.value = v;
		this.index = 0;
	}
	
	IndexOfPropPoint.prototype.exec = function(item) {
		if (item[this.prop] == this.value) this.env.stop = this.found = true;
		else this.index++;
	}
	
	IndexOfPropPoint.prototype.run = function(a) {
		var i = 0, l = a.length, p = this.prop, v = this.value, n = this.next;
		while (i < l) { if (a[i][p] == v) { this.index = i; this.found = true; break; } else i++; }
	}

	function EachPoint(fn) { this.exec = fn; }
	
	function MinPoint(rank) { // end point
		this.next  = null;
		this.env   = null;
		this.func  = rank;
		this.value = Number.MAX_VALUE;
		this.obj   = undefined;
	}
	
	MinPoint.prototype.exec = function(item) {
		var v = this.func(item);
		if (v < this.value) { this.value = v; this.obj = item; }
	}

	function MaxPoint(rank) { // end point
		this.next  = null;
		this.env   = null;
		this.func  = rank;
		this.value = Number.MIN_VALUE;
		this.obj   = undefined;
	}

	MaxPoint.prototype.exec = function(item) {
		var v = this.func(item);
		if (v > this.value) { this.value = v; this.obj = item; }
	}
	
	function InvokePoint(method) { // end point
		this.next = null;
		this.env  = null;
		this.name = method;
	}
	
	InvokePoint.prototype.exec = function(item) { item[this.name](); }
	
	InvokePoint.prototype.run = function(a) {
		var i = 0, l = a.length, n = this.name;
		while(i < l) { a[i++][n](); }
	}

	function TakePoint(size) {
		this.next = null;
		this.env  = null;
		this.i    = 0;
		this.num  = size;
	}
	
	TakePoint.prototype.exec = function(item) {
		this.next.exec(item);
		if (++this.i == this.num) { this.env.stop = true; this.i = 0; }
	}

	function CountPoint(func) { // end point
		this.next   = null;
		this.env    = null;
		this.func   = func;
		this.counts = { num: 0, total: 0 };
	}
	
	CountPoint.prototype.exec = function(item) {
		this.counts.total++;
		if (this.func(item)) this.counts.num++;
	}

	// true unique-ness testing is a near-impossible or made too damn slow in JS, so an approximation will do:
	function UniqPoint(test) { // still experimental
		this.next = null;
		this.env  = null;
		this.test = test || false;
		this.set  = []; // for primitives
		this.ref  = []; // for object references
	}
	
	UniqPoint.prototype.exec = function(item) {
		if (typeof item == "object") {
			var i = this.ref.length;
			if (this.test)
				while (i--) { if (this.test(item, this.ref[i])) return; }
			else
				while (i--) { if (this.ref[i] == item) return; }
			this.ref.push(item);
			this.next.exec(item);
		}
		else if (!this.set[item]) { this.set[item] = true; this.next.exec(item); }
	}

	function LengthPoint() { // end point
		this.next = null;
		this.env  = null;
		this.num  = 0;
	}
	
	LengthPoint.prototype.exec = function(item) { this.num++; }

	function ReducePoint(fn, m) { // end point
		this.next = null;
		this.env  = null;
		this.func = fn;
		this.memo = m || false;
	}
	
	ReducePoint.prototype.exec = function(item) {
		if (this.memo === false)
			this.memo = item;
		else
			this.memo = this.func(this.memo, item);
	}

	function AllPoint(array) { // end point
		this.next  = null;
		this.env   = null;
		this.i     = 0;
		this.array = [];
	}
	
	AllPoint.prototype.exec = function(item) { this.array[this.i++] = item; }
	
	AllPoint.prototype.run = function(a) {
		var i = 0, l = a.length, b = this.array;
		while (i < l) b[i] = a[i++];
		this.array = b;
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
		
	function Run(point) {
		this.env.stop = false;
		this.env.skip = 0;
		if (point) this.pushPoint(point);
		var start = this.points[0];

		if (start.run) { start.run(this.target); }
		else {
			var a = this.target, l = a.length, i = 0, e = this.env;
			if (e.take)
				while (i < l && !e.stop) start.exec(a[i++]);
			else
				while (i < l) start.exec(a[i++]);
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
	
	function IndexOf(p, v) {
		this.env.take = true;
		var point;
		if (v !== undefined)
			point = new IndexOfPropPoint(p, v);
		else
			point = new IndexOfPoint(p);
		this.run(point);
		return point.found ? point.index : -1;
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
		return point.memo;
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
	
	function Skip(num) {
		this.pushPoint(new SkipPoint(num));
		return this;
	}
	
	function Is(inst) {
		this.pushPoint(new IsPoint(inst));
		return this;
	}
	
	function Type(type) {
		this.pushPoint(new TypePoint(type));
		return this;
	}
	
	function First(o) {
		this.env.take = true;
		var point;
		if (typeof o == "function")
			point = new FirstFuncPoint(o);
		else if (typeof o == "number")
			return o < 0 ? undefined : this.take(o);
		else
			point = new FirstPoint();
		this.pushPoint(point);
		var a = this.toArray();
		return a.length > 0 ? a[0] : undefined;
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
	
	function Last(count) {
		var a = this.toArray();
		if (!count) count = 1;
		return a.splice(a.length - count);
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
		this.pushPoint(new GetPoint(num));
		var a = this.toArray();
		return a.length > 0 ? a[0] : undefined;
	}
	
	function Uniq(test) {
		this.pushPoint(new UniqPoint(test));
		return this;
	}
	
	function Sort(f) {
		var v = this.toArray();
		if (f) v.sort(f); else v.sort();
		return v;
	}
	
	/** Interface Layer **/
	
	function Chain(array) {
		this.env    = { take: false, stop: false, skip: 0 };
		this.target = array || [];
		this.points = [];
	}
	
	Chain.prototype = {
		pushPoint : PushPoint,
		replaceEnd: ReplaceEnd,
		run       : Run,

		accept    : Where,
		contains  : Contains,
		count     : Count,
		drop      : Skip,
		each      : Each,
		every     : Every,
		exists    : Contains,
		filter    : Where,
		filterBy  : FilterBy,
		filterOut : Reject,
		first     : First,
		get       : Get,
		groupBy   : GroupBy,
		indexOf   : IndexOf,
		invoke    : Invoke,
		is        : Is,
		last      : Last,
		length    : Length,
		map       : Map,
		max       : Max,
		min       : Min,
		random    : Random,
		reduce    : Reduce,
		reject    : Reject,
		sample    : Random,
		size      : Length,
		skip      : Skip,
		slice     : Slice,
		some      : Contains,
		sort      : Sort,
		take      : Take,
		toArray   : ToArray,
		type      : Type,
		uniq      : Uniq,
		unique    : Uniq,
		where     : Where,
		whereBy   : FilterBy,
		zip       : Zip,
	}
	
	return function(arr) { return new Chain(arr); }
})();
