#include "graph.h"
#define NORTH 0
#define EAST 90
#define SOUTH 180
#define WEST -90
#define UP 45
#define DOWN -45

Graph createEngGraph(){
    Graph g(1000);
    g.addEdge(0, 1, 50 , EAST);
    g.addEdge(1, 2, 110 , SOUTH);
    g.addEdge(2, 3, 30 , WEST);
    g.addEdge(3, 4, 1 , UP);
    g.addEdge(4, 5, 10 , EAST);
    g.addEdge(5, 6, 35 , SOUTH);
    g.addEdge(6, 7, 65 , SOUTH);
    g.addEdge(7, 8, 20 , WEST);
    g.addEdge(7, 9, 20 , EAST);
    g.addEdge(7, 10, 120 , SOUTH);
    g.addEdge(10, 11, 60 , SOUTH);
    g.addEdge(11, 12, 10 , EAST);
    g.addEdge(11, 13, 10 , WEST);
    g.addEdge(11, 14, 60 , SOUTH);
    g.addEdge(14, 15, 10 , EAST);
    g.addEdge(14, 16, 10 , WEST);
    g.addEdge(14, 17, 80 , SOUTH);
    g.addEdge(17, 18, 10 , EAST);
    g.addEdge(17, 19, 10 , WEST);
    g.addEdge(17, 20, 65 , SOUTH);
    g.addEdge(20, 21, 20 , SOUTH);
    g.addEdge(5, 22, 40 , NORTH);
    g.addEdge(22, 23, 20 , WEST);
    return g;
}