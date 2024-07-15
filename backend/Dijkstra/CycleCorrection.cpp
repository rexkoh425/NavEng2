#include "shortest_path.cpp"
#include "graph.cpp"
#include "EngGraph.h"
#include <cstdlib>
#include <stdlib.h>
#include <iostream>
#include <chrono>
#include <string>
#include <sstream>

int main(){
    vector<int> blocked_nodes;

    Graph test1 = createEngGraph(blocked_nodes);
    int num_of_nodes = test1.num_vertices();
    
}