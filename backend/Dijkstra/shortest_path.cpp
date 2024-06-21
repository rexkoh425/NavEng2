#include "shortest_path.h"
#include "heap.hpp"

#define INFINITY_SELF 999999

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
  vector<int> dist_array;
  int dist_from_source = 0;
  int num_of_nodes = g.num_vertices();
  bool *visit_table = new bool[num_of_nodes];
  int *parent = new int[num_of_nodes];
  int *parent_direction = new int[num_of_nodes];
  int *parent_dist = new int[num_of_nodes];//
  bool reached_dest = false;
  
  for(int i = 0 ; i < num_of_nodes; i++){
    if(i != source){
      table.insert(GraphEdge(i , INFINITY_SELF , 0));
    }else{
      table.insert(GraphEdge(source ,0 , 0));
    }
    parent[i] = i;
    parent_direction[i] = 0;
  }
  int count = 0 ;
  while(!table.empty()){
    GraphEdge current_node = table.extractMin();
    int current_dest = current_node.dest();
    int current_weight = current_node.weight();
    visit_table[current_dest] = true;
    if(current_dest == dest){
      dist_from_source = current_weight;
      reached_dest = true;
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
        parent_direction[node] = dir;
        parent_dist[node] = current.weight();//
      }
    }
  }

  if(!visit_table[dest]){
    throw std::out_of_range("cannot reach dest");
  }

  int parent_node = dest;
  path.insert(path.begin() , parent_node);
  while(parent_node != source && parent[parent_node] != parent_node){//was (parent_node != source)
    direction.insert(direction.begin(), parent_direction[parent_node]);
    dist_array.insert(dist_array.begin(), parent_dist[parent_node]);
    parent_node = parent[parent_node];
    path.insert(path.begin() , parent_node);
  }

  delete parent;
  delete visit_table;
  delete parent_direction;
  return Path(dist_from_source, path , direction , dist_array);
}
