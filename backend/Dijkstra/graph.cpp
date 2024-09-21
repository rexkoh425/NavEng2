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
