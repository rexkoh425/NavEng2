#ifndef __SHORTESTPATH_H__
#define __SHORTESTPATH_H__

#include <vector>
#include "graph.h"

using std::vector;

class Path {
 private:
  const int _total_distance;
  const vector<int> _path;
  const vector<int> _directions;
  const vector<int> _dist_array;

 public:
  Path(int total_distance, vector<int> path , vector<int>directions , vector<int> dist_array)
      : _total_distance(total_distance), _path(path) , _directions(directions) , _dist_array(dist_array){}
  int total_distance() const { return _total_distance; }
  const vector<int>& path() const { return _path; }
  const vector<int>& direction() const { return _directions; }
  const vector<int>& dist_array() const { return  _dist_array; }
};

Path shortestPath(const Graph& g, int source, int dest);

#endif 
