#include "shortest_path.h"
#include "heap.hpp"

#define INFINITY_SELF 999999

/*
static inline int heuristic_cost(const Graph& g, int from, int to) {
#ifdef USE_GRAPH_HEURISTIC
  return g.heuristic(from, to);
#else
  (void)g; (void)from; (void)to;
  return 0;
#endif
}
*/

static inline int heuristic_cost(const Graph& g, int from, int to) {
  return g.heuristic(from, to);
}

static inline bool check_node_exist(int nodes, int source, int dest) {
  return (source >= 0 && dest >= 0 && source < nodes && dest < nodes);
}

Path shortestPath(const Graph& g, int source, int dest) {
  const int n = g.num_vertices();

  if (!check_node_exist(n, source, dest)) {
    throw std::out_of_range("no such nodes");
  }

  // Open set (min-heap) keyed by f = g + h using your existing Heap/GraphEdge
  Heap open(n);

  // Book-keeping
  std::vector<int> path;
  std::vector<int> direction;
  std::vector<int> dist_array;

  bool* closed = new bool[n];              // closed set (visited after pop)
  int*  parent = new int[n];               // parent backpointers
  int*  parent_dir = new int[n];           // direction taken to reach node
  int*  parent_edge_cost = new int[n];     // edge cost used to reach node
  int*  g_score = new int[n];              // true cost from source to node

  // Initialize arrays and heap entries
  for (int i = 0; i < n; ++i) {
    closed[i] = false;
    parent[i] = i;
    parent_dir[i] = 0;
    parent_edge_cost[i] = 0;
    g_score[i] = INFINITY_SELF;

    // Pre-insert each node; we'll "decrease-key" them as we discover better f
    open.insert(GraphEdge(i, INFINITY_SELF, 0));
  }

  // Seed the source
  g_score[source] = 0;
  const int f0 = heuristic_cost(g, source, dest);
  // Update the source's key to f0
  open.changeKey(GraphEdge(source, INFINITY_SELF, 0), GraphEdge(source, f0, 0));

  bool reached = false;

  // A* main loop
  while (!open.empty()) {
    GraphEdge cur = open.extractMin();  // node with smallest f
    const int u = cur.dest();
    const int f_u = cur.weight();

    // If the smallest key is still "infinite", remaining nodes are unreachable
    if (f_u >= INFINITY_SELF) break;

    if (closed[u]) continue;            // skip stale entries
    closed[u] = true;

    if (u == dest) {                    // goal reached with optimal g_score[dest]
      reached = true;
      break;
    }

    // Relax neighbors
    const auto& nbrs = g.edges_from(u);
    for (auto it = nbrs.begin(); it != nbrs.end(); ++it) {
      const GraphEdge e = *it;
      const int v = e.dest();
      const int w = e.weight();
      if (closed[v]) continue;

      const int tentative_g = g_score[u] + w;
      if (tentative_g < g_score[v]) {
        g_score[v] = tentative_g;

        parent[v] = u;
        parent_dir[v] = e.dir();
        parent_edge_cost[v] = w;

        const int f_v = tentative_g + heuristic_cost(g, v, dest);

        // Your Heap::changeKey uses the dest id mapping; follow your Dijkstra pattern
        open.changeKey(e, GraphEdge(v, f_v, e.dir()));
      }
    }
  }

  if (!closed[dest]) {
    delete[] closed;
    delete[] parent;
    delete[] parent_dir;
    delete[] parent_edge_cost;
    delete[] g_score;
    throw std::out_of_range("cannot reach dest");
  }

  // Reconstruct path from parents
  const int total_distance = g_score[dest];
  int node = dest;
  path.insert(path.begin(), node);
  while (node != source && parent[node] != node) {
    direction.insert(direction.begin(), parent_dir[node]);
    dist_array.insert(dist_array.begin(), parent_edge_cost[node]);
    node = parent[node];
    path.insert(path.begin(), node);
  }

  // Cleanup
  delete[] closed;
  delete[] parent;
  delete[] parent_dir;
  delete[] parent_edge_cost;
  delete[] g_score;

  return Path(total_distance, path, direction, dist_array);
}
