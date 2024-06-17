#include "shortest_path.cpp"
#include "shortest_path.h"
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
    vector<int> blocked_nodes;

    // Access JSON data
    if (doc.IsObject()) {
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
                  blocked_nodes.push_back(blocked[i].GetInt());
              } else {
                  std::cerr << "Non-integer value in \"blocked\" array" << std::endl;
                  return 1;
              }
          }
        }
    } else {
      std::cerr << "Input is not a JSON object" << std::endl;
      return 1;
    }
    
    //vector<int> blocked_nodes;
    Graph test1 = createEngGraph(blocked_nodes);
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
    for(int i = 0 ; i < size-1 ; i++){
      cout << final_directions[i];
      if(i != size-2){
        cout << ",";
      }
    }

    cout << "|" << distance;

    cout << "|";
    //int total = 0;
    for(int i = 0 ; i < size-1 ; i++){
      cout << dist_between[i];
      //total += dist_between[i];
      if(i != size-2){
        cout << ",";
      }
    }
    //cout << "|" << total; //for debug addition of dist
    return 0 ;
}