#include "graph.h"
#include "shortest_path.h"
#include "heap.hpp"

#define INFINITY_SELF 999999
#define NORTH 0
#define EAST 90
#define SOUTH 180
#define WEST -90
#define UP 45
#define DOWN -45

bool check_node_exist(int nodes , int source , int dest){
  return (source >= 0 && dest >= 0 && source < nodes && dest < nodes);
}

Path shortestPath(const Graph& g, int source, int dest) {
  
  if(!check_node_exist(g.num_vertices() , source ,dest)){
    throw std::out_of_range("no such nodes");
  }
  
  Heap table(g.num_vertices());
  vector<int> path;
  vector<int> direction;
  int dist_from_source = 0;
  int num_of_nodes = g.num_vertices();
  bool *visit_table = new bool[num_of_nodes];
  int *parent = new int[num_of_nodes];
  int *parent_path = new int[num_of_nodes];
  
  for(int i = 0 ; i < num_of_nodes; i++){
    if(i != source){
      table.insert(GraphEdge(i , INFINITY_SELF , 0));
    }else{
      table.insert(GraphEdge(source ,0 , 0));
    }
    parent[i] = i;
    parent_path[i] = 0;
  }

  while(!table.empty()){
    GraphEdge current_node = table.extractMin();
    int current_dest = current_node.dest();
    int current_weight = current_node.weight();
    visit_table[current_dest] = true;
    if(current_dest == dest){
      dist_from_source = current_weight;
      break;
    }
    forward_list<GraphEdge> neighbours = g.edges_from(current_dest);
    //for every element in forward list relax them
    for(auto i = neighbours.begin() ; i != neighbours.end() ; i++){
      GraphEdge current = *i;
      int node = current.dest();
      int table_dist = table[node].weight();
      if(!visit_table[node] &&  (current_weight + current.weight()) < table_dist){
        table_dist = current_weight + current.weight();
        int dir = current.dir();
        GraphEdge new_node = GraphEdge(node , table_dist , dir);
        table.changeKey(current  , new_node);
        parent[node] = current_dest;
        parent_path[node] = dir;
      }
    }
  }

  if(!visit_table[dest]){
    throw std::out_of_range("cannot reach dest");
  }

  int parent_node = dest;
  path.insert(path.begin() , parent_node);

  while(parent_node != source){
    direction.insert(direction.begin(), parent_path[parent_node]);
    parent_node = parent[parent_node];
    path.insert(path.begin() , parent_node);
  }

  delete parent;
  delete visit_table;
  delete parent_path;
  return Path(dist_from_source, path , direction);
}
