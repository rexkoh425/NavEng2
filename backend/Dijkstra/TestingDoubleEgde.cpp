
#include "graph.cpp"
#include "EngGraph.h"
#include <cstdlib>
#include <stdlib.h>
#include <iostream>
#include <chrono>
#include <string>
#include <sstream>
#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
using namespace std;
using namespace rapidjson;

int main(){
    
    vector<int> blocked_nodes;
    Graph test1 = createEngGraph(blocked_nodes , true);
    vector<int> wrong_nodes;
    for(int i = 0 ; i < test1.num_vertices() ; i++){
        forward_list<GraphEdge> neighbours = test1.edges_from(i);
        int array[6] = {0};
        for(auto j = neighbours.begin() ; j != neighbours.end() ; j++){
            GraphEdge current = *j;
            int direction = current.dir();
            switch(direction){
                case NORTH : 
                    array[0] += 1;
                    break;
                case EAST :
                    array[1] += 1;
                    break;
                case SOUTH :
                    array[2] += 1;
                    break; 
                case WEST : 
                    array[3] += 1;
                    break;
                case UP :
                    array[4] += 1;
                    break;
                case DOWN :
                    array[5] += 1;
                    break; 
            }
        }
        for(int j = 0 ; j < 6 ; j++){
            if(array[j] >= 2){
                wrong_nodes.push_back(i);
            }
        }
    }
    cout << "started : ";
    for(int i = 0 ; i < wrong_nodes.size() ; i++){
        cout << wrong_nodes[i] << "," ;
    }
    return 0 ;
}