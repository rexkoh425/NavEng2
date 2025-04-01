cmake_minimum_required(VERSION 3.14)
project(DijkstraTest LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

enable_testing()

add_library(nav STATIC
  backend/Dijkstra/graph.cpp
  backend/Dijkstra/shortest_path.cpp
)
target_include_directories(nav PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})


add_executable(DijkstraTest
  backend/Dijkstra/main_test.cpp
)
target_link_libraries(DijkstraTest PRIVATE nav GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(DijkstraTest)
