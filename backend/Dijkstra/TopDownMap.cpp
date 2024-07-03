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
    vector<int> nodes_array;
    // Access JSON data
    if (doc.IsObject()) {
        
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
    } else {
      std::cerr << "Input is not a JSON object" << std::endl;
      return 1;
    }
    vector<int> blocked_array;
    Graph g = createEngGraph(blocked_array);
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