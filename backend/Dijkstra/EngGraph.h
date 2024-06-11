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
    g.addEdge(1, 153, 70 , SOUTH);
    g.addEdge(153, 2, 40 , SOUTH);
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
    g.addEdge(22, 24, 90 , EAST);
    g.addEdge(24, 25, 85 , EAST);
    g.addEdge(25, 26, 170 , EAST);
    g.addEdge(26, 27, 20 , EAST);
    g.addEdge(26, 28, 40 , SOUTH);
    g.addEdge(28, 29, 40 , SOUTH);
    g.addEdge(29, 30, 10 , SOUTH);
    g.addEdge(28, 31, 20 , EAST);
    g.addEdge(31, 32, 1 , UP); //free
    g.addEdge(32, 33, 20 , WEST);
    g.addEdge(33, 34, 40 , NORTH);
    g.addEdge(34, 35, 20 , EAST);
    g.addEdge(33, 36, 40 , SOUTH);
    g.addEdge(36, 37, 40 , WEST);
    g.addEdge(27, 35, 1 , UP); //extra
    g.addEdge(37, 38, 65 , SOUTH);
    g.addEdge(38, 39, 150 , SOUTH);
    g.addEdge(37, 40, 80 , NORTH);
    g.addEdge(40, 41, 135 , NORTH);
    g.addEdge(41, 42, 135 , WEST);
    g.addEdge(42, 43, 20 , NORTH);
    g.addEdge(42, 44, 60 , SOUTH);
    g.addEdge(44, 45, 40 , WEST);
    g.addEdge(45, 46, 30 , NORTH);
    g.addEdge(45, 47, 50 , SOUTH);
    g.addEdge(47, 48, 20 , WEST);
    g.addEdge(45, 49, 20 , WEST);
    g.addEdge(23, 48, 1 , UP); //extra
    g.addEdge(4, 49, 1 , UP); //extra
    g.addEdge(44, 50, 135 , SOUTH);
    g.addEdge(50, 51, 20 , WEST);
    g.addEdge(50, 52, 70 , SOUTH);
    g.addEdge(52, 53, 20 , WEST);
    g.addEdge(52, 54, 50 , SOUTH);
    g.addEdge(54, 55, 20 , WEST);
    g.addEdge(54, 56, 25 , SOUTH);////////
    g.addEdge(56, 57, 20 , WEST);////////
    g.addEdge(56, 58, 130 , SOUTH);
    g.addEdge(58, 59, 20 , WEST);
    g.addEdge(58, 60, 35 , SOUTH);
    g.addEdge(60, 61, 20 , WEST);
    g.addEdge(49, 62, 1 , UP);//free
    g.addEdge(62, 63, 20 , EAST);
    g.addEdge(63, 64, 40 , SOUTH);
    g.addEdge(63, 65, 40 , NORTH);
    g.addEdge(65, 66, 20 , WEST);
    g.addEdge(65, 67, 30 , NORTH);
    g.addEdge(67, 68, 60 , NORTH);
    g.addEdge(68, 69, 20 , WEST);
    g.addEdge(68, 70, 20 , NORTH);
    g.addEdge(70, 71, 20 , WEST);
    g.addEdge(70, 72, 65 , NORTH);
    g.addEdge(72, 73, 20 , NORTH);
    g.addEdge(72, 74, 50 , EAST);
    g.addEdge(74, 75, 20 , NORTH);
    g.addEdge(74, 76, 20 , EAST);
    g.addEdge(76, 77, 20 , NORTH);
    g.addEdge(76, 78, 65 , SOUTH);
    g.addEdge(78, 79, 20 , EAST);
    g.addEdge(78, 80, 20 , SOUTH);
    g.addEdge(80, 81, 20 , EAST);
    g.addEdge(80, 82, 60 , SOUTH);
    g.addEdge(82, 83, 40 , SOUTH);
    g.addEdge(83, 84, 20 , WEST);
    g.addEdge(83, 85, 20 , EAST);
    g.addEdge(78, 86, 20 , WEST);
    g.addEdge(83, 87, 35 , SOUTH);
    g.addEdge(87, 88, 20 , EAST);
    g.addEdge(87, 89, 40 , SOUTH);
    g.addEdge(89, 90, 20 , SOUTH);
    g.addEdge(32, 88 , 1 , UP); //extra
    g.addEdge(48, 66 , 1 , UP); //extra
    g.addEdge(35, 85 , 1 , UP); //extra
    g.addEdge(88, 91, 1 , UP); //free
    g.addEdge(91, 92, 20 , WEST);
    g.addEdge(92, 93, 40 , SOUTH);
    g.addEdge(93, 94, 20 , SOUTH);
    g.addEdge(93, 95, 20 , WEST);
    g.addEdge(92, 96, 40 , NORTH);
    g.addEdge(96, 97, 20 , EAST);
    g.addEdge(96, 98, 30 , NORTH);
    g.addEdge(98, 99, 70 , NORTH);
    g.addEdge(99, 100, 60 , NORTH);
    g.addEdge(100, 101, 70 , NORTH);
    g.addEdge(101, 102, 60 , WEST);
    g.addEdge(102, 103, 70 , WEST);
    g.addEdge(103, 104, 90 , WEST);
    g.addEdge(104, 105, 30 , SOUTH);
    g.addEdge(105, 106, 20 , WEST);
    g.addEdge(105, 107, 40 , SOUTH);
    g.addEdge(107, 108, 20 , WEST);
    g.addEdge(107, 109, 40 , SOUTH);
    g.addEdge(62, 108 , 1 , UP); //extra
    g.addEdge(66, 105 , 1 , UP); //extra
    g.addEdge(85, 97 , 1 , UP); //extra
    g.addEdge(108, 110, 1 , UP); //free56
    g.addEdge(106, 113, 1 , UP); //extra
    g.addEdge(91 , 138 , 1 , UP); //extra
    g.addEdge(97 , 137 , 1,  UP); //extra
    g.addEdge(110, 111, 20 , EAST);
    g.addEdge(111, 112, 40 , NORTH);
    g.addEdge(112, 113, 20 , WEST);
    g.addEdge(111, 114, 40 , SOUTH);
    g.addEdge(114, 115, 95 , SOUTH);
    g.addEdge(115, 116, 30 , WEST);
    g.addEdge(115, 117, 20 , EAST);
    g.addEdge(115, 118, 85 , SOUTH);
    g.addEdge(118, 119, 30 , WEST);
    g.addEdge(118, 120, 90 , SOUTH);
    g.addEdge(120, 121, 30 , WEST);
    g.addEdge(120, 122, 20 , EAST);
    g.addEdge(120, 123, 85 , SOUTH);
    g.addEdge(123, 124, 20 , EAST);
    g.addEdge(123, 125, 30 , WEST);
    g.addEdge(123, 126, 80 , SOUTH);
    g.addEdge(126, 127, 30 , WEST);
    g.addEdge(126, 128, 20 , EAST);
    g.addEdge(126, 129, 90 , SOUTH);
    g.addEdge(129, 130, 70 , EAST);
    g.addEdge(111, 131, 40 , EAST);
    g.addEdge(131, 132, 100 , EAST);
    g.addEdge(132, 133, 120 , SOUTH);
    g.addEdge(133, 134, 55 , SOUTH);
    g.addEdge(134, 135, 40 , EAST);
    g.addEdge(135, 136, 40 , NORTH);
    g.addEdge(136, 137, 20 , EAST);
    g.addEdge(135, 138, 20 , EAST);
    g.addEdge(134, 139, 125 , SOUTH);
    g.addEdge(139, 140, 20 , EAST);
    g.addEdge(139, 141, 95 , SOUTH);
    g.addEdge(141, 142, 75 , EAST);
    g.addEdge(142, 143, 35 , NORTH);
    g.addEdge(110, 144, 1 , UP);//free
    g.addEdge(144, 145, 20 , EAST);
    g.addEdge(145, 146, 40 , NORTH);
    g.addEdge(145, 147, 40 , SOUTH);
    g.addEdge(146, 148, 20 , WEST);
    g.addEdge(138, 149, 1 , UP);//free
    g.addEdge(137, 152, 1 , UP);//extra67
    g.addEdge(113, 148 , 1 , UP);//extra67
    g.addEdge(149, 150, 20 , WEST);
    g.addEdge(150, 151, 40 , NORTH);
    g.addEdge(151, 152, 20 , EAST);
    g.addEdge(153, 154, 20 , WEST);
    g.addEdge(2, 155, 40 , SOUTH);
    g.addEdge(155, 156, 70 , SOUTH);
    g.addEdge(1, 157, 50 , NORTH);
    g.addEdge(1, 158, 110 , EAST);
    g.addEdge(158, 159, 110 , EAST);
    g.addEdge(159, 160, 40 , NORTH);
    g.addEdge(159, 161, 55 , SOUTH);
    g.addEdge(161, 162, 45 , SOUTH);
    g.addEdge(162, 163, 40 , SOUTH);
    g.addEdge(163, 164, 30 , EAST);
    g.addEdge(164, 165, 20 , SOUTH);
    g.addEdge(161, 166, 20 , EAST);
    g.addEdge(162, 167, 20 , EAST);
    g.addEdge(158, 168, 120 , SOUTH);
    g.addEdge(168, 169, 80 , SOUTH);
    g.addEdge(168, 162, 110 , EAST);//////////
    g.addEdge(169, 170, 90 , SOUTH);
    g.addEdge(10, 171, 130 , EAST);
    g.addEdge(171, 172, 10 , NORTH);
    g.addEdge(170, 172 , 1 , UP);//EA Stairs level 1 -2 
    g.addEdge(171, 173, 30 , SOUTH);
    g.addEdge(173, 174, 1 , UP); //level 2- 3
    g.addEdge(174, 175, 30 , SOUTH);
    g.addEdge(167, 31 , 1 , UP);//extra12
    g.addEdge(166, 27 , 1 , UP);//extra12
    g.addEdge(154, 23 , 1 , UP);//extra12
    g.addEdge(142, 176, 220 , EAST);
    g.addEdge(176, 177, 65 , EAST);
    g.addEdge(177, 178, 20 , NORTH);
    g.addEdge(177, 179, 240 , EAST);
    g.addEdge(179, 180, 240 , SOUTH);
    g.addEdge(180, 181, 50 , WEST);
    g.addEdge(181, 182, 115 , SOUTH);
    g.addEdge(182, 183, 20 , WEST);
    g.addEdge(182, 184, 25 , SOUTH);
    g.addEdge(180, 185, 30 , EAST);
    g.addEdge(184, 186, 30 , WEST);
    g.addEdge(186, 187, 20 , SOUTH);
    g.addEdge(186, 188, 410 , WEST);
    g.addEdge(188, 189, 55 , SOUTH);
    g.addEdge(189, 190, 40 , SOUTH);
    g.addEdge(190, 191, 20 , EAST);
    g.addEdge(130, 189, 40 , WEST);//closed loop EA floor 6 to E1A
    g.addEdge(246, 242, 95 , WEST);//closed loop EA floor 7 to E1A
    g.addEdge(187, 192, 1 , UP);
    g.addEdge(192, 193, 20 , NORTH);
    g.addEdge(193, 194, 20 , EAST);
    g.addEdge(194, 195, 25 , NORTH);
    g.addEdge(195, 196, 20 , WEST);
    g.addEdge(192, 197, 1 , UP);
    g.addEdge(197, 198, 25 , NORTH);
    g.addEdge(198, 199, 20 , WEST);
    g.addEdge(197, 200, 1 , UP);
    g.addEdge(200, 201, 25 , NORTH);
    g.addEdge(201, 202, 20 , WEST);
    g.addEdge(200, 203, 1 , UP);
    g.addEdge(203, 204, 25 , NORTH);
    g.addEdge(204, 205, 20 , WEST);
    g.addEdge(187, 206, 1 , DOWN);
    g.addEdge(206, 207, 25 , NORTH);
    g.addEdge(207, 208, 20 , WEST);
    g.addEdge(208, 183, 1 , UP);//E1A FLOOR 2-3 stairs
    g.addEdge(183, 196 , 1 , UP);//E1A FLOOR 3-4 stairs
    g.addEdge(196, 199 , 1 , UP);//E1A FLOOR 4-5 stairs
    g.addEdge(199, 202 , 1 , UP);//E1A FLOOR 5-6 stairs
    g.addEdge(202, 205 , 1 , UP);//E1A FLOOR 6-7 stairs
    ///////////////////////////////////////////////////
    g.addEdge(237, 226 , 1 , UP);//E1A FLOOR 5-6 stairs
    g.addEdge(226, 221 , 1 , UP);//E1A FLOOR 6-7 stairs
    g.addEdge(207, 209, 30 , NORTH);
    g.addEdge(209, 210, 80 , NORTH);
    g.addEdge(210, 211, 25 , EAST);
    g.addEdge(211, 212, 80 , EAST);
    g.addEdge(212, 213, 60 , EAST);
    g.addEdge(213, 214, 50 , EAST);
    g.addEdge(214, 215, 30 , EAST);
    g.addEdge(209, 216, 20 , EAST);
    g.addEdge(204, 217, 30 , NORTH);
    g.addEdge(217, 218, 20 , EAST);
    g.addEdge(217, 219, 75 , NORTH);
    g.addEdge(219, 220, 480 , EAST);
    g.addEdge(220, 221, 150 , SOUTH);
    g.addEdge(201, 222, 150 , NORTH);
    g.addEdge(222, 223, 405 , EAST);
    g.addEdge(223, 224, 20 , SOUTH);
    g.addEdge(223, 225, 75 , EAST);
    g.addEdge(225, 226, 150 , SOUTH);
    g.addEdge(198, 227, 90 , NORTH);
    g.addEdge(227, 228, 20 , EAST);
    g.addEdge(227, 229, 60 , NORTH);
    g.addEdge(229, 230, 175 , EAST);
    g.addEdge(230, 231, 20 , SOUTH);
    g.addEdge(230, 232, 10 , EAST);
    g.addEdge(232, 233, 20 , SOUTH);
    g.addEdge(232, 234, 80 , EAST);
    g.addEdge(234, 235, 20 , SOUTH);
    g.addEdge(234, 236, 215 , EAST);
    g.addEdge(236, 237, 150 , SOUTH);
    g.addEdge(195, 238, 45 , NORTH);
    g.addEdge(238, 239, 65 , NORTH);
    g.addEdge(180, 240, 30 , SOUTH);
    g.addEdge(193, 241, 410 , WEST);
    g.addEdge(241, 242, 55 , SOUTH);
    g.addEdge(242, 243, 30 , SOUTH);
    g.addEdge(243, 244, 20 , EAST);
    g.addEdge(147, 245, 135 , SOUTH);
    g.addEdge(245, 246, 350 , SOUTH);
    g.addEdge(246, 247, 20 , SOUTH);
    g.addEdge(246, 248, 20 , WEST);
    return g;
}
