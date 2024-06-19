cmake_minimum_required(VERSION 3.10)
project(DijkstraTest)

# Set the C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add the Google Test subdirectory
add_subdirectory(googletest)

# Include directories
include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})

enable_testing()

# Add your source files and test files
add_executable(DijkstraTest backend/Dijkstra/Dijkstra_test.cpp backend/Dijkstra/shortest_path.cpp)

# Link Google Test libraries
target_link_libraries(DijkstraTest GTest::gtest_main)

