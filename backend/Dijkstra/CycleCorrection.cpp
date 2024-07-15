#include "shortest_path.cpp"
#include "graph.cpp"
#include "EngGraph.h"
#include <cstdlib>
#include <stdlib.h>
#include <iostream>
#include <chrono>
#include <string>
#include <sstream>
#include <fstream>

int opposite(int dir){
    int opposite_dir = 180 - dir;
    if(dir == EAST || dir == WEST || dir == UP || dir == DOWN){
        opposite_dir = -dir;
    }
    return opposite_dir;
}

class Node {

    private :
        int node_id;
        int x_coor;
        int y_coor;
        int z_coor;
    public :

        

        Node(){
            node_id = 0;
            x_coor = 0;
            y_coor = 0;
            z_coor = 0;
        }

        Node(int node_num , int x_coordinate , int y_coordinate , int z_coordinate){
            node_id = node_num;
            x_coor = x_coordinate;
            y_coor = y_coordinate;
            z_coor = z_coordinate;
        }

        Node add(int node_num , int direction , int weight){
            int new_x = x_coor;
            int new_y = y_coor;
            int new_z = z_coor;
            switch(direction){
                case NORTH : 
                    new_y += weight;
                    break;
                case EAST :
                    new_x += weight;
                    break;
                case SOUTH : 
                    new_y -= weight;
                    break;
                case WEST : 
                    new_x -= weight;
                    break;
                case UP :
                    new_z += weight;
                    break;
                case DOWN : 
                    new_z -= weight;
                    break;
            }
            return Node(node_num , new_x , new_y , new_z);   
        }

        int get_x(){
            return x_coor;
        }

        int get_y(){
            return y_coor;
        }

        int get_z(){
            return z_coor;
        }

        int get_node(){
            return node_id;
        }

};

void vector_print(Node source , Node destination){

    cout << "vector((" << source.get_x() << "," << source.get_y() << "," << source.get_z() << ") , (" << destination.get_x() << "," << destination.get_y() << "," << destination.get_z() << "))" << endl;   
}


int main(){
    vector<int> blocked_nodes;

    Graph test1 = createEngGraph(blocked_nodes , false);
    int num_of_nodes = test1.num_vertices();

    Node* node_details = new Node[num_of_nodes];
    bool* visited = new bool[num_of_nodes];
    for(int i = 0 ; i < num_of_nodes ; i++){
        visited[i] = false;
    }
    std::stack<int> to_visit;
    node_details[0] = Node(0 ,0 , 0, 40);
    to_visit.push(0);
    visited[0] = true;
    //generate new node coordinates based on graph
    while(!to_visit.empty()){
        int node = to_visit.top();
        to_visit.pop();
        forward_list<GraphEdge> neighbours = test1.edges_from(node);
        for(auto j = neighbours.begin() ; j != neighbours.end() ; j++){
            GraphEdge current = *j;
            if(!visited[current.dest()]){
                /*
                if(current.dest() == 302){
                    cout << node << endl;
                }
                */
                to_visit.push(current.dest());
                visited[current.dest()] = true;
                node_details[current.dest()] = node_details[node].add(current.dest() ,current.dir() , current.weight());
            }
        }
    }

    for(int i = 0; i < num_of_nodes ; i++){
        Node node = node_details[i];
        //cout << node.get_node() << " :";
        cout<< "(" << node.get_x() << " ," << node.get_y() << " ," << node.get_z() << ")" << endl;;
    }
    /*
    vector<vector<int>> pairs;
    vector<int> first{200 ,-275,120};
    vector<int> second{200 ,-405, 120};
    //(200,-275,120),(200,-405,120))
    pairs.push_back(first);
    pairs.push_back(second);
    for(int j = 0 ; j < pairs.size() ; j++){
        for(int i = 0; i < num_of_nodes ; i++){
            Node node = node_details[i];
            if(node.get_x() == pairs[j][0] && node.get_y() == pairs[j][1] && node.get_z() == pairs[j][2]){
                cout << i << " ";
                break;
            }
        }
    }
    */
    
    for(int i = 0 ; i < num_of_nodes ; i++){
        forward_list<GraphEdge> neighbours = test1.edges_from(i);

        for(auto j = neighbours.begin() ; j != neighbours.end() ; j++){
            GraphEdge current = *j;
            vector_print(node_details[i] , node_details[current.dest()]);
        }
    }
    
    





}