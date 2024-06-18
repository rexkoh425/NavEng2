#include <gtest/gtest.h>
#include "shortest_path.h"

TEST(DijkstraTest, BasicAssertions) {
    vector<int> blocked_nodes;
    Graph g(5 , blocked_nodes);
    g.addEdge(0, 1, 4 , NORTH);
    g.addEdge(0, 2, 1 , SOUTH);
    g.addEdge(2, 1, 2 , EAST);
    g.addEdge(1, 3, 1 , WEST);
    g.addEdge(2, 3, 5 , WEST);
    g.addEdge(3, 4, 3 , NORTH);

    Path result = shortestPath(g , 0 , 4);
    vector<int> final_path = result.path();
    vector<int> final_directions = result.direction();
    vector<int> dist_between = result.dist_array();
    int distance = result.total_distance();
    EXPECT_EQ(distance, 7);
    EXPECT_EQ(final_path.size(), 5);
    EXPECT_EQ(final_path[0], 0);
    EXPECT_EQ(final_path[1], 2);
    EXPECT_EQ(final_path[2], 1);
    EXPECT_EQ(final_path[3], 3);
    EXPECT_EQ(final_path[4], 4);
    EXPECT_EQ(dist_between.size(), 4);
    EXPECT_EQ(final_directions.size(), 4);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}