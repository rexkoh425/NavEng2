#pragma once
#include <math.h>
#include <iostream>
using namespace std;

#ifndef HEAPHPP
#define HEAPHPP

#define DEFAULTHEAPSIZE 10001

template <class T>
class Heap {
 protected:
  T* _heap;
  int heap_size;

 public:
  Heap() { 
    _heap = new T[DEFAULTHEAPSIZE]; 
    heap_size = 0;
  }

  int size() const {
    // TODO: implement this
    return heap_size;
  }

  bool empty() const {
    if(heap_size <= 0){
      return true;
    }
    return false;
  }
  void insert(const T&);
  T extractMax();
  T peekMax() const;
  void printHeapArray() const;
  void printTree() const;
  void changeKey(const T& from, const T& to);
  void deleteItem(const T&);

  ~Heap() { delete[] _heap; };

  void bubble_up(int index){
    int new_index = (index-1)/2;

    if(new_index < 0){
      return;
    }
    T val = _heap[index];
    if(val > _heap[new_index]){
      swap(new_index,index);
      bubble_up(new_index);
    }
  }

  void swap(int index1 , int index2){
    T temp = _heap[index2];   
    _heap[index2] = _heap[index1];
    _heap[index1] = temp;
  }

  void bubble_down(int index){

    int new_index = 0;
    bool left = false;
    bool right = false;

    if(index*2+1 < heap_size){
      left = (_heap[index*2+1] > _heap[index]);
    }
    if(index*2+2 < heap_size){
      right = (_heap[index*2+2] > _heap[index]);
    }
    if(left && right){
      if(_heap[index*2+1] > _heap[index*2+2]){
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

  int element_index(T value){
          
    for(int i = 0 ; i < heap_size ; i++){
      if(_heap[i] == value){
        return i;
      }
    }
    return -1;
  }
};

template <class T>
void Heap<T>::insert(const T& item){
  _heap[heap_size] = item;
  bubble_up(heap_size);
  heap_size++;
}

template <class T>
T Heap<T>::extractMax() {
  // TODO: implement this
    if(heap_size == 0){
      throw std::out_of_range("no elements in heap");
    }
    T temp = _heap[0];
    swap(0,heap_size-1);
    heap_size--;
    bubble_down(0);
    return temp;
}

template <class T>
T Heap<T>::peekMax() const {
  if(heap_size <= 0){
    throw std::out_of_range("empty heap");
  }
  return _heap[0];
};

template <class T>
void Heap<T>::printHeapArray() const {
  for (int i = 0; i < size(); i++) {
    cout << _heap[i] << " ";
  }
  cout << endl;
}

template <class T>
void Heap<T>::changeKey(const T& from, const T& to) {
  // TODO: implement this
  int index = element_index(from);
  if(index == -1){
    throw std::out_of_range("no such element");
  }
  _heap[index] = to;

  int new_index = (index-1)/2;

  if(new_index >= 0 && _heap[index] > _heap[new_index]){
    bubble_up(index);
  }else{
    bubble_down(index);
  }

}

template <class T>
void Heap<T>::deleteItem(const T& x) {
  int index = element_index(x);
  if(index == -1){
    throw std::out_of_range("no such element");
  }
  swap(index , heap_size-1);
  //_heap[heap_size-1] = _heap[heap_size];
   heap_size--;
  int new_index = (index-1)/2;
 
  if(new_index >= 0 && _heap[index] > _heap[new_index]){
    bubble_up(index);
  }else{
    bubble_down(index);
  }
 

}

template <class T>
void Heap<T>::printTree() const {
  int parity = 0;
  if (size() == 0) return;
  int space = pow(2, 1 + (int)log2f(size())), i;
  int nLevel = (int)log2f(size()) + 1;
  int index = 0, endIndex;
  int tempIndex;

  for (int l = 0; l < nLevel; l++) {
    index = 1;
    parity = 0;
    for (i = 0; i < l; i++) index *= 2;
    endIndex = index * 2 - 1;
    index--;
    tempIndex = index;
    while (index < size() && index < endIndex) {
      for (i = 0; i < space - 1; i++) cout << " ";
      if (index == 0)
        cout << "|";
      else if (parity)
        cout << "\\";
      else
        cout << "/";
      parity = !parity;
      for (i = 0; i < space; i++) cout << " ";
      index++;
    }
    cout << endl;
    index = tempIndex;
    while (index < size() && index < endIndex) {
      for (i = 0; i < (space - 1 - ((int)log10(_heap[index]))); i++)
        cout << " ";
      cout << _heap[index];
      for (i = 0; i < space; i++) cout << " ";
      index++;
    }

    cout << endl;
    space /= 2;
  }
}

#endif
