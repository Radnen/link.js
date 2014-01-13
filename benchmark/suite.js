function Suite() {
	this.tests = [];
	this.results = [];
}

function Test(name, time) {
	this.name = name;
	this.time = time;
}

Test.prototype.toString = function() {
	return this.name + ": " + this.time + "ms";
}

Suite.prototype = {
	add: function(name, fn, times) {
		this.tests.push({ name: name, fn: fn, times: times || 100 });
		return this;
	},
	
	on: function(type, call) {
		this[type] = call;
		return this;
	},
	
	run: function() {
		this.results = [];
		for (var i = 0, l = this.tests.length; i < l; ++i) {
			var runs = [];
			for (var j = 0, k = this.tests[i].times; j < k; ++j) {
				var t = window.performance.now();
				this.tests[i].fn();
				runs.push(window.performance.now() - t);
			}
			var avg = this.findAverage(runs);
			var test = new Test(this.tests[i].name, avg);
			var event = { target: test };
			this.cycle(event);
			this.results.push(test);
		}
		this.complete();
	},
	
	getFastest: function() {
		return Lazy(this.results).min(function(e) { return e.time; }).name;
	},
	
	findAverage: function(a) { 
		var i = a.length, n = 0;
		while(i--) { n += a[i]; }
		return n / a.length;
	},
};