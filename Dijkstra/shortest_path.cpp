#include "graph.h"
#include "shortest_path.h"
#include "heap.hpp"

#define INFINITY_SELF 999999
#define NORTH 123456
#define SOUTH -123456
#define EAST 654321
#define WEST -654321

bool check_node_exist(int nodes , int source , int dest){
  return (source >= 0 && dest >= 0 && source < nodes && dest < nodes);
}

Path shortestPath(const Graph& g, int source, int dest) {
  
  if(!check_node_exist(g.num_vertices() , source ,dest)){
    throw std::out_of_range("no such nodes");
  }
  
  Heap<GraphEdge> table;
  vector<int> path;
  vector<int> direction;
  int dist_from_source = 0;
  int num_of_nodes = g.num_vertices();
  int VISITED = -(num_of_nodes + 1);
  int *heap_table = new int[num_of_nodes];
  int *parent = new int[num_of_nodes];
  int *parent_path = new int[num_of_nodes];
  
  for(int i = 0 ; i < num_of_nodes; i++){
    heap_table[i] = INFINITY_SELF;
    parent[i] = i;
    parent_path[i] = 0;
  }
  GraphEdge temp =  GraphEdge(source , 0 , 0);
  heap_table[source] = 0;
  table.insert(temp);

  while(!table.empty()){
    GraphEdge current_node = table.extractMax();
    int current_dest = current_node.dest();
    int current_weight = current_node.weight();
    heap_table[current_dest] = VISITED;
    if(current_dest == dest){
      dist_from_source = current_weight;
      break;
    }
    forward_list<GraphEdge> neighbours = g.edges_from(current_dest);
    //for every element in forward list relax them
    for(auto i = neighbours.begin() ; i != neighbours.end() ; i++){
      GraphEdge current = *i;
      int node = current.dest();
      int smallest_dist = heap_table[node];
      if(smallest_dist != VISITED &&  (current_weight + current.weight()) < smallest_dist){
        if(smallest_dist != INFINITY_SELF){
          table.deleteItem(current);
        }
        smallest_dist = current_weight + current.weight();
        int dir = current.dir();
        GraphEdge new_node = GraphEdge(node , smallest_dist , dir);
        heap_table[node] = smallest_dist;
        //table.changeKey(current  , new_node);
        table.insert(new_node);
        parent[node] = current_dest;
        parent_path[current_dest] = dir;
      }
    }
  }

  if(heap_table[dest] == INFINITY_SELF){
    throw std::out_of_range("cannot reach dest");
  }

  int parent_node = dest;
  path.insert(path.begin() , parent_node);

  while(parent_node != source){
    parent_node = parent[parent_node];
    direction.insert(direction.begin(), parent_path[parent_node]);
    path.insert(path.begin() , parent_node);
  }

  delete parent;
  delete heap_table;
  delete parent_path;
  return Path(dist_from_source, path , direction);
}
