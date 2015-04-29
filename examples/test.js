require("source-map-support").install();
var lpastar = require(".");
var repl = require("repl");

lpastar_path = lpastar({
  start: 5,
  isEnd: function(n) { return n === 0; },
  end: 0,
  neighbor: function(x) { return [x - 1, x + 1]; },
  distance: function(a, b) { return 1; },
  heuristic: function(x) { return x; }
});

repl.start({
  useGlobal: true
});
