#include <iostream>
using namespace std;

#define NORTH  0
#define EAST  1
#define SOUTH  2
#define WEST  3

void cycle(int array[4]){
    int temp = array[0];
    for(int i = 0 ; i < 3 ; i ++){
        array[i] = array[i+1];
    }
    array[3] = temp;
}

bool opposite(int dir1 , int dir2){
    return (dir1 == NORTH && dir2 == SOUTH) ||
    (dir2 == NORTH && dir1 == SOUTH) ||
    (dir1 == EAST && dir2 == WEST) ||
    (dir2 == EAST && dir1 == WEST);
}

int opposite(int dir){
    switch(dir){
        case NORTH :
            return SOUTH;
        case EAST :
            return WEST;
        case SOUTH :
            return NORTH;
        case WEST :
            return EAST;
        default :
            return NORTH;
    }
}
/* POV */
/* NORTH ::::: NORTH : NORTH :: EAST : EAST :: SOUTH : SOUTH :: WEST : WEST */
/* EAST ::::: NORTH : EAST :: EAST : SOUTH :: SOUTH : WEST :: WEST : NORTH */
/* SOUTH ::::: NORTH : SOUTH :: EAST : WEST :: SOUTH : NORTH :: WEST : EAST */
/* WEST ::::: NORTH : WEST :: EAST : NORTH :: SOUTH : EAST :: WEST : SOUTH */
int main(){

  int map[4] = {NORTH , EAST , SOUTH , WEST};
  bool enter[4] = {1,1,1,1};//relative to abo north
  bool exit[4] = {false};//relative to abo north
  for(int i = 0 ; i < 4 ; i++){
    if(enter[i]){
        exit[opposite(i)] = true;
    }
  }
  for(int i = 0 ; i < 4 ; i++){
    if(enter[i]){//3 WEST
        for(int j = 0 ; j < 4 ; j++){//1 EAST 
            if(exit[map[j]] && !opposite(map[j] , i)){
                switch (i) {//POV
                    case 0 :
                        std::cout << "North";
                        break;
                    case 1 :
                        std::cout << "East";
                        break;
                    case 2 :
                        std::cout << "South";
                        break;
                    case 3 :
                        std::cout << "West";
                        break;
                }
                switch (j){
                    case NORTH :
                        std::cout << " North";
                        break;
                    case EAST :
                        std::cout << " East";
                        break;
                    case SOUTH :
                        std::cout << " South";
                        break;
                    case WEST :
                        std::cout << " West"; 
                        break;
                }
                std::cout << endl;
            }
        }
    }
    cycle(map);
  }
}