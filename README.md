ORBITAL PROJECT BY REX AND RAVI

Using React App

1) Start Frontend by entering frontend folder and typing npm start into terminal
2) Start Backend by entering backend folder and typing npm start into terminal

Photo taking 

1) Explore level first to identify potential nodes
2) Open space = Cross junction 
3) ok to be T-junction but only 2 nodes connected in data e.g. toliet is the remaining side.Put as T-junction
4) Take in a rough pov and ok angle


When you want to add new nodes

1) get all inputs from form
2) add edges in main.cpp from Edgeinput.txt
3) add inputs to mysql server from mysql_input.txt
4) update the coordinates and vector in desmos
5) take photo of the directions and send them through telegram , save on computer and name them
6) upload pictures and name them in local

When you want to add nodes between existing nodes

1) Generate statements using form
2) Remove orginal edges and add two more edge between new and original in mai.cpp / Edgeinput.txt
3) Remove original desmos vector only 
4) add coordinates and vector of each of the two connections

When you add nodes wrongly

1) delete node from mysql using form
2) remove the edges from main.cpp / Edgeinput.txt
3) remove inputs from mysql_inputs.txt
4) remove from desmos 

GENERAL DEBUG NODE CONNECTIONS

1) Check if the nodes are connected in the right direction
2) Check if the pictures are named properly
3) Check if the picture is added correctly


TESTS

npm run ImageTest -> test all sql file have a corresponding image

npm test -> test all images are ok

TestDoubleEdge.cpp -> test whether edges have been added wrongly in graph

CycleCorrection.cpp -> able to check if all coordinates match & whether all images are 1D (essential for top-down map)

Algorithms

from PIL import py.py -> able to generate arrows on pictures

rename_database.test.js -> converts - to _ in database pictures


When add new nodes 

add to sql statement to database
add edges to main , and update number of nodes
update block sheltered table in data base
run double edge.cpp to find two edges with same direction for same node
update elevator_building and special room(if applicable) table in supabase
run main and start debug route using get_diff
run cycle correction.cpp and correct unmatched cycles
generate arrows via python 
check for weird junctions and correct arrow by looking through pictures
sort into respective folders and upload to database
run ImageTest to ensure all images are loadable
Compile UNIX before uploading