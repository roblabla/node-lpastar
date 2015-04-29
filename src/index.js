/*
 * Let's first implement LPA*, on which D* is based.
 * LPA* (Lifelong Planning A*) is an iterative version of A*, which
 * reuses previous results in order to speed up the replanning phases.
 *
 * Compared to A*, it adds a new value to every state, called "rhs". To explain,
 * A* stores in "g" a "score" based on heuristic. LPA*'s rhs is a 1-step
 * lookahead of g. In other words, "rhs is the minimum of the neighbour's g
 * + the cost of moving to that neighbour".
 */

var PriorityQueue = require("priorityqueuejs");
var R = require("ramda");

function comparator(a, b)
{
  if (a.key[0] == b.key[0])
    return b.key[1] - a.key[1];
  else
    return b.key[0] - a.key[0];
}

function defaultHash(x)
{
  return (x.toString());
}

// Wooo, class
class LPAStar
{
  constructor({ start, end, neighbor, distance, heuristic, hash = defaultHash } = {})
  {
    this.neighbors = neighbor;
    this.distance = distance;
    // TODO : wrap heuristics such that it returns 0 if isEnd == true.
    // that would bridge the gap between node-astar and node-lpastar
    this.heuristics = heuristic;
    this.end = end;
    this.hash = hash;
    this.queue = new PriorityQueue(comparator);
    this.nodes = new Map();
    this.start_node = this.getNode(start);
    this.start_node.rhs = 0;
    this.goal_node = this.getNode(end);
    this.queue.enq({ key: [this.heuristics(this.start_node.data), 0], value: this.start_node });
    this.computeShortestPath();
  }

  calculateKey(s)
  {
    return [Math.min(s.g, s.rhs) + this.heuristics(s.data), Math.min(s.g, s.rhs)];
  }

  getNode(data)
  {
    var hashed = this.hash(data);
    if (this.nodes.has(hashed))
      return this.nodes.get(hashed);
    else
    {
      var newnode = { g: Infinity, rhs: Infinity, data: data };
      this.nodes.set(hashed, newnode);
      return newnode;
    }
  }

  updateVertex(u)
  {
    if (u != this.start_node)
      u.rhs = R.min(R.map((x) => { return x.g + this.distance(u.data, x.data); }, R.map(this.getNode.bind(this), this.neighbors(u.data))));
    // TODO : I wonder if this is very very wrong...
    this.queue.remove(u, (x, y) => { return this.hash(x.data) === this.hash(y.value.data) ? 0 : 1 });
    if (u.g != u.rhs)
      this.queue.enq({ key: this.calculateKey(u), value: u });
  }

  computeShortestPath()
  {
    // TODO : this.calculateKey(this.goal_node) is :
    // 1. Constant
    // 2. not dependant on heuristics
    // As such, it's probably possible to guess it from isEnd.
    while (comparator(this.queue.peek(), { key: this.calculateKey(this.goal_node) }) > 0
        || this.goal_node.rhs != this.goal_node.g)
    {
      var u = this.queue.deq().value;
      if (u.g > u.rhs)
      {
        u.g = u.rhs;
        R.map(this.getNode.bind(this), this.neighbors(u.data)).forEach((x) => {
          this.updateVertex(x);
        });
      }
      else
      {
        u.g = +Infinity;
        R.map(this.getNode.bind(this), this.neighbors(u.data)).forEach((x) => {
          this.updateVertex(x);
        });
        this.updateVertex(u);
      }
    }
  }

}

function reconstructPath(self, node, pathSoFar = []) {
  pathSoFar.unshift(node.data);
  if (node === self.start_node)
    return pathSoFar;
  else
  {
    var nextNode = R.minBy(R.prop('g'),  R.map(self.getNode.bind(self), self.neighbors(node.data)));
    return reconstructPath(self, nextNode, pathSoFar);
  }
}

function sendRet(pathfinder) {
  return {
    status: "success",
    cost: pathfinder.goal_node.g,
    path: reconstructPath(pathfinder, pathfinder.goal_node),
    replan: function(x) {
      pathfinder.updateVertex(pathfinder.getNode(x));
      return sendRet(pathfinder);
    }
  }
}

export default function lpastar(opts) {
  var pathfinder = opts.context ? opts.context : new LPAStar(opts);
  return sendRet(pathfinder);
};
