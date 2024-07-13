#include "shortest_path.cpp"
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

void MapObj(Graph g , vector<int> nodes_array){
  bool in_array_map[1000] = {false};
    for(int i = 0 ; i < nodes_array.size() ; i++){
        in_array_map[nodes_array[i]] = true;
    }
    for(int i = 0 ; i < nodes_array.size() ; i++){
        forward_list<GraphEdge> neighbours = g.edges_from(nodes_array[i]);
        cout << nodes_array[i] << "_";
        for(auto i = neighbours.begin() ; i != neighbours.end() ; i++){
            GraphEdge current = *i;
            if(in_array_map[current.dest()]){
                cout << current.dest() << "," << current.weight() << "," << current.dir();
                cout << "/";
            }
        }

        cout << "|";
    }
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
    int dest = 0;
    bool getMapObj = false;
    vector<int> blocked_nodes;
    vector<int> nodes_array;

    // Access JSON data
    if (doc.IsObject()) {
      if(doc.HasMember("getMapObj")){
        getMapObj = doc["getMapObj"].GetBool();
      }
      if(getMapObj){
        if (doc.HasMember("nodes")) {
          const Value& nodes = doc["nodes"];

          for (SizeType i = 0; i < nodes.Size(); ++i) {
            if (nodes[i].IsInt()) {
              nodes_array.push_back(nodes[i].GetInt() - 1);
            } else {
              std::cerr << "Non-integer value in \"nodes\" array" << std::endl;
              return 1;
            }
          }
        }
      }else{
        if (doc.HasMember("source")) {
          source = doc["source"].GetInt() - 1;
        }
        if (doc.HasMember("destination")) {
          dest = doc["destination"].GetInt() - 1;
        }
        if (doc.HasMember("blocked")) {
          const Value& blocked = doc["blocked"];

          for (SizeType i = 0; i < blocked.Size(); ++i) {
              if (blocked[i].IsInt()) {
                  blocked_nodes.push_back(blocked[i].GetInt() - 1);
              } else {
                  std::cerr << "Non-integer value in \"blocked\" array" << std::endl;
                  return 1;
              }
          }
        }
      }
    } else {
      std::cerr << "Input is not a JSON object" << std::endl;
      return 1;
    }
    
    //vector<int> blocked_nodes;
    Graph test1 = createEngGraph(blocked_nodes);
    if(getMapObj){
      MapObj(test1 , nodes_array);
    }else{

      Path result = shortestPath(test1 , source ,  dest);
      vector<int> final_path = result.path();
      vector<int> final_directions = result.direction();
      vector<int> dist_between = result.dist_array();
      int distance = result.total_distance();
      
      int size = final_path.size();
      for(int i = 0 ; i < size ; i++){
        cout << final_path[i] + 1;
        if(i != size-1){
          cout << ",";
        }
      }
      cout << "|";
      size = final_directions.size();
      for(int i = 0 ; i < size ; i++){
        cout << final_directions[i];
        if(i != size-1){
          cout << ",";
        }
      }

      cout << "|" << distance;

      cout << "|";
      size = dist_between.size();
      for(int i = 0 ; i < size ; i++){
        cout << dist_between[i];
        if(i != size-1){
          cout << ",";
        }
      }
      return 0 ;
    }
    
}