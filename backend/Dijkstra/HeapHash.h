#include <iostream>
#include <heap.hpp>
#include <graph.h>
using namespace std;

#define EMPTY -1
#define DELETED -2

class HeapHash {
    private :
        int *_table;
        int table_size;
        int filled_slots;
    public :
        HeapHash(int);
        ~HeapHash();
        void insert(GraphEdge , int);
        void remove(GraphEdge);
        void swap(GraphEdge , GraphEdge);
};

HeapHash::HeapHash(int size){
    _table = new int[size];
    table_size = size;
    filled_slots = 0;

    for(int i = 0 ; i < size ; i++){
        _table[i] = EMPTY;
    }
}

HeapHash::~HeapHash(){
    delete[] _table;
}

void HeapHash::insert(GraphEdge e , int heap_size){
    _table[e.dest()] = heap_size;
}

void HeapHash::remove(GraphEdge e){
    _table[e.dest()] = DELETED;
}

void HeapHash::swap(GraphEdge e1 , GraphEdge e2){
    int temp = _table[e1.dest()];
    _table[e1.dest()] = _table[e2.dest()];
    _table[e2.dest()] = temp;

}
