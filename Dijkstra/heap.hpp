#pragma once
#include <math.h>
#include <iostream>
#include "graph.h"
using namespace std;

#ifndef HEAPHPP
#define HEAPHPP

class Heap {
 protected:
  GraphEdge* _heap;
  int *_index_table;
  int heap_size;

 public:
  Heap(int num_of_nodes) { 
    _heap = new GraphEdge[num_of_nodes]; 
    _index_table = new int[num_of_nodes];
    heap_size = 0;

    for(int i = 0 ; i < num_of_nodes ; i++){
      _index_table[i] = 0;
    }
  }

  int size() const {
    return heap_size;
  }

  bool empty() const {
    if(heap_size <= 0){
      return true;
    }
    return false;
  }
  void insert(const GraphEdge&);
  GraphEdge extractMin();
  GraphEdge peekMax() const;
  void printHeapArray() const;
  void changeKey(const GraphEdge& from, const GraphEdge& to);
  void deleteItem(const GraphEdge&);
  GraphEdge operator[](int);

  ~Heap() { 
    delete[] _heap; 
    delete[] _index_table;
  };

  void bubble_up(int index){
    int new_index = (index-1)/2;

    if(new_index < 0){
      return;
    }
    GraphEdge val = _heap[index];
    if(val < _heap[new_index]){
      swap(new_index,index);
      bubble_up(new_index);
    }
  }

  void swap(int index1 , int index2){
    GraphEdge e1 = _heap[index1];
    GraphEdge e2 = _heap[index2]; 
    _heap[index2] = e1;
    _heap[index1] = e2;
    int temp = _index_table[e1.dest()];
    _index_table[e1.dest()] = _index_table[e2.dest()];
    _index_table[e2.dest()] = temp;
  }

  void bubble_down(int index){

    int new_index = 0;
    bool left = false;
    bool right = false;

    if(index*2+1 < heap_size){
      left = (_heap[index*2+1] < _heap[index]);
    }
    if(index*2+2 < heap_size){
      right = (_heap[index*2+2] < _heap[index]);
    }
    if(left && right){
      if(_heap[index*2+1] < _heap[index*2+2]){
        new_index = index*2+1;
      }else{
        new_index = index*2+2;
      }
      swap(index,new_index);
      bubble_down(new_index);
    
    }else if(left){
      new_index = index*2+1;
      swap(index,new_index);
      bubble_down(new_index);
    }else if(right){
      new_index = index*2+2;
      swap(index,new_index);
      bubble_down(new_index);
    }
  }

  int element_index(GraphEdge value){
          
    for(int i = 0 ; i < heap_size ; i++){
      if(_heap[i] == value){
        return i;
      }
    }
    return -1;
  }
};

void Heap::insert(const GraphEdge& item){
  _heap[heap_size] = item;
  _index_table[item.dest()] = heap_size;
  bubble_up(heap_size);
  heap_size++;
}

GraphEdge Heap::extractMin() {
    if(heap_size == 0){
      throw std::out_of_range("no elements in heap");
    }
    GraphEdge temp = _heap[0];
    swap(0,heap_size-1);
    heap_size--;
    bubble_down(0);
    return temp;
}


GraphEdge Heap::peekMax() const {
  if(heap_size <= 0){
    throw std::out_of_range("empty heap");
  }
  return _heap[0];
};


void Heap::printHeapArray() const {
  for (int i = 0; i < size(); i++) {
    cout << _heap[i] << " ";
  }
  cout << endl;
}


void Heap::changeKey(const GraphEdge& from, const GraphEdge& to) {
  // TODO: implement this
  int index = _index_table[from.dest()];
  if(index == -1){
    throw std::out_of_range("no such element");
  }
  _index_table[from.dest()] = 0;
  _heap[index] = to;
  _index_table[to.dest()] = index;

  int new_index = (index-1)/2;

  if(new_index >= 0 && _heap[index] < _heap[new_index]){
    bubble_up(index);
  }else{
    bubble_down(index);
  }
}


void Heap::deleteItem(const GraphEdge& x) {
  int index = _index_table[x.dest()];
  if(index == -1){
    throw std::out_of_range("no such element");
  }
  swap(index , heap_size-1);
  heap_size--;
  int new_index = (index-1)/2;
 
  if(new_index >= 0 && _heap[index] < _heap[new_index]){
    bubble_up(index);
  }else{
    bubble_down(index);
  }
}

GraphEdge Heap::operator[](int dest){
  return _heap[_index_table[dest]];
}

#endif
