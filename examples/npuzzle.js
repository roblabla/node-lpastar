var lpastar = require(".");
var R = require("ramda");
require("source-map-support").install();

var start = [3, 6, 2,
             4, 7, 1,
             5, 8, 9];
var end   = [1, 2, 3,
             4, 5, 6,
             7, 8, 9];

function switchX(block, pos1, pos2) {
  var newblock = block.slice(0);
  var tmp = newblock[pos1];
  newblock[pos1] = newblock[pos2];
  newblock[pos2] = tmp;
  return newblock;
}
function neighborWithoutOld(block) {
  function addStateIf(cond, newState) {
    if (cond && !hasVisited(newState)) nextStates.push(newState);
  }
  var nextStates = [];
  var pos = block.indexOf(9);
  var hasVisited = R.compose(R.flip(R.any)(visited), R.eqDeep)
  addStateIf(pos % 3 > 0, switchX(block, pos, pos - 1));
  addStateIf(pos % 3 < 2, switchX(block, pos, pos + 1));
  addStateIf(Math.floor(pos / 3) > 0, switchX(block, pos, pos - 3));
  addStateIf(Math.floor(pos / 3) < 2, switchX(block, pos, pos + 3));
  return (nextStates);
}

var visited = [start];
function neighborWithOld(block) {
    function addStateIf(cond, newState) {
      if (cond) nextStates.push(newState);
    }
    var nextStates = [];
    var pos = block.indexOf(9);
    addStateIf(pos % 3 > 0, switchX(block, pos, pos - 1));
    addStateIf(pos % 3 < 2, switchX(block, pos, pos + 1));
    addStateIf(Math.floor(pos / 3) > 0, switchX(block, pos, pos - 3));
    addStateIf(Math.floor(pos / 3) < 2, switchX(block, pos, pos + 3));
    return (nextStates);
}

console.log(JSON.stringify(lpastar({
  start: start,
  end: end,
  neighbor: neighborWithOld,
  distance: function(x, y) {
    /*var hasVisited = R.compose(R.flip(R.any)(visited), R.eqDeep);
    console.log(visited, y);
    if (!hasVisited(y))
    {
      visited.push(y);*/
      return 1;
    /*}
    else
      return Infinity;*/
  },
  heuristic: function(state) {
    function calculateDistance(pos1, pos2) {
      var x1 = pos1 % 3;
      var y1 = Math.floor(pos1 / 3);
      var x2 = pos2 % 3;
      var y2 = Math.floor(pos2 / 3);
      return (Math.abs(x2 - x1) + Math.abs(y2 - y1));
    }
    var currPos = 0;
    var j = 0;
    while (currPos < state.length)
    {
      j += calculateDistance(currPos, state[currPos] - 1);
      currPos++;
    }
    return (j);
  }
}), null, 4));
