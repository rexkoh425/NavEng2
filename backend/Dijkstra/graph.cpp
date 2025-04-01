#include "graph.h"
#include <fstream>

using std::endl;

std::ostream& operator<<(std::ostream& os, GraphEdge const& e) {
  return os << " (d:" << e.dest() << " w:" << e.weight() << ")";
}

ostream& operator<<(ostream& os, const Graph& g) {
  for (int i = 0; i < g.num_vertices(); ++i) {
    os << "Vertex " << i << ": ";
    for (auto e : g.edges_from(i)) {
      os << e;
    }
    os << endl;
  }
  return os;
}

void Graph::addEdge(int source, int dest, int weight , int dir , bool undirected) {
  
  if(blocked_nodes[dest] || blocked_nodes[source]){
    return;
  }
  
  _vertices[source].emplace_front(dest, weight , dir);
  if(undirected){
    int opposite_dir = 180 - dir;
    if(dir == EAST || dir == WEST || dir == UP || dir == DOWN){
      opposite_dir = -dir;
    }
    _vertices[dest].emplace_front(source,weight , opposite_dir);
  }
}

#include <queue>
#include <cstdlib> // abs

// Translate a directed edge (dir, weight) into a delta on (x,y,z)
static inline void apply_dir(int dir, int w, int xu, int yu, int zu,
                             int &xv, int &yv, int &zv) {
  xv = xu; yv = yu; zv = zu;
  switch (dir) {
    case EAST:  xv = xu + w; break;
    case WEST:  xv = xu - w; break;
    case NORTH: yv = yu + w; break;
    case SOUTH: yv = yu - w; break;
    case UP:    zv = zu + 1; break;    
    case DOWN:  zv = zu - 1; break;    
    default: 
      break;
  }
}

void Graph::init_coords(int origin, int ox, int oy, int oz) {
  if (origin < 0 || origin >= num_vertices()) return;

  // reset
  std::fill(_x.begin(), _x.end(), INT_MAX);
  std::fill(_y.begin(), _y.end(), INT_MAX);
  std::fill(_z.begin(), _z.end(), INT_MAX);

  _x[origin] = ox; _y[origin] = oy; _z[origin] = oz;

  std::queue<int> q;
  q.push(origin);

  while (!q.empty()) {
    int u = q.front(); q.pop();
    int xu = _x[u], yu = _y[u], zu = _z[u];

    for (const auto &e : _vertices[u]) {
      int v = e.dest();
      int xv, yv, zv;
      apply_dir(e.dir(), e.weight(), xu, yu, zu, xv, yv, zv);

      if (_x[v] == INT_MAX) {
        // first assignment
        _x[v] = xv; _y[v] = yv; _z[v] = zv;
        q.push(v);
      } else {
        // Already has coords — if inconsistent, keep existing (or log)
        // You could add a consistency check here if you want.
      }
    }
  }
}


int Graph::heuristic(int from, int to) const {
  if (!has_coord(from) || !has_coord(to)) return 0;
  const int stair_cost = 40;
  int dx = std::abs(_x[from] - _x[to]);
  int dy = std::abs(_y[from] - _y[to]);
  int dz = std::abs(_z[from] - _z[to]);
  return dx + dy + stair_cost * dz;
}
