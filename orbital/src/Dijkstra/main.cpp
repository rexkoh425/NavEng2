#include "shortest_path.cpp"
#include "shortest_path.h"
#include "graph.cpp"
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

Graph createComplexGraph(){
  Graph g(20);
  g.addEdge(0, 1, 3 , NORTH);
  g.addEdge(1, 2, 3 , EAST);
  g.addEdge(2, 4, 4 , NORTH);
  g.addEdge(2, 3, 1 , SOUTH);
  g.addEdge(2, 7, 2 , EAST);
  g.addEdge(3, 9, 3 , EAST);
  g.addEdge(3, 18, 5 ,SOUTH);
  g.addEdge(5, 6, 2 , EAST);
  g.addEdge(5, 19, 3 , WEST);
  g.addEdge(6, 12, 3 , EAST);
  g.addEdge(6, 7, 6 , SOUTH);
  g.addEdge(7, 8, 3 , SOUTH);
  g.addEdge(7, 14, 9 , EAST);
  g.addEdge(9, 15, 8 , EAST);
  g.addEdge(9, 17, 4 , EAST);
  g.addEdge(10, 16, 6 , EAST);
  g.addEdge(11, 12, 4 , NORTH);
  g.addEdge(13, 14, 6 , SOUTH);
  g.addEdge(14, 16, 3 , SOUTH);
  g.addEdge(15, 16, 3 , NORTH);
  return g;
}

int main(){
  
    std::string inputData;
    std::getline(std::cin, inputData);

    // Parse JSON string into a JSON document
    Document doc;
    if (doc.Parse(inputData.c_str()).HasParseError()) {
        std::cerr << "Error parsing JSON" << std::endl;
        return 1;
    }
    int source = 0;
    int dest = 0 ;

    // Access JSON data
    if (doc.IsObject()) {
        // Process JSON object
        // Example: Accessing a key named "example"
        if (doc.HasMember("source") && doc["source"].IsString()) {
            std::string value = doc["source"].GetString();
            source = stoi(value) - 1;
        }

        if (doc.HasMember("destination") && doc["destination"].IsString()) {
            std::string value = doc["destination"].GetString();
            dest = stoi(value) - 1  ;
        }
    } else {
        std::cerr << "Input is not a JSON object" << std::endl;
        return 1;
    }

    Graph test1 = createComplexGraph();
    Path result = shortestPath(test1 , source  , dest);
    
    vector<int> final_path = result.path();
    vector<int> final_directions = result.direction();
    int distance = result.total_distance();

    int size = final_path.size();
    for(int i = 0 ; i < size ; i++){
      cout << final_path[i] + 1;
      if(i != size-1){
        cout << ",";
      }
    }
    cout << "|";
    for(int i = 0 ; i < size-1 ; i++){
      cout << final_directions[i];
      if(i != size-2){
        cout << ",";
      }
    }

    cout << "|" << distance;
    return 0 ;
}