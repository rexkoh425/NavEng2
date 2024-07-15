#include "graph.h"

Graph createEngGraph(vector<int> blocked_nodes){
    Graph g(354  , blocked_nodes);
    g.addEdge(0, 1, 50 , EAST);
    g.addEdge(1, 153, 70 , SOUTH);
    g.addEdge(153, 2, 40 , SOUTH);
    g.addEdge(2, 3, 30 , WEST);
    g.addEdge(3, 4, 40 , UP);
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
    g.addEdge(31, 32, 40 , UP); //free
    g.addEdge(32, 33, 20 , WEST);
    g.addEdge(33, 34, 40 , NORTH);
    g.addEdge(34, 35, 20 , EAST);
    g.addEdge(33, 36, 40 , SOUTH);
    g.addEdge(36, 37, 40 , WEST);
    g.addEdge(27, 35, 40 , UP); //extra
    g.addEdge(37, 38, 65 , SOUTH);
    g.addEdge(38, 39, 150 , SOUTH);
    g.addEdge(37, 40, 80 , NORTH);
    g.addEdge(40, 41, 135 , NORTH);
    g.addEdge(41, 42, 135 , WEST);
    g.addEdge(42, 43, 20 , NORTH);
    g.addEdge(42, 44, 60 , SOUTH);
    g.addEdge(44, 45, 40 , WEST);///////
    g.addEdge(45, 46, 30 , SOUTH);//////
    g.addEdge(45, 47, 50 , NORTH);///////
    g.addEdge(47, 48, 20 , WEST);
    g.addEdge(45, 49, 20 , WEST);
    g.addEdge(23, 48, 40 , UP); //extra
    g.addEdge(4, 49, 40 , UP); //extra
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
    g.addEdge(49, 62, 40 , UP);//free
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
    g.addEdge(32, 88 , 40 , UP); //extra
    g.addEdge(48, 66 , 40 , UP); //extra
    g.addEdge(35, 85 , 40 , UP); //extra
    g.addEdge(88, 91, 40 , UP); //free
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
    g.addEdge(62, 108 , 40 , UP); //extra
    g.addEdge(66, 106 , 40 , UP); //extra
    g.addEdge(85, 97 , 40 , UP); //extra
    g.addEdge(108, 110, 40 , UP); //free56
    g.addEdge(106, 113, 40 , UP); //extra
    g.addEdge(91 , 138 , 40 , UP); //extra
    g.addEdge(97 , 137 , 40,  UP); //extra
    g.addEdge(110, 111, 20 , EAST);//(111 , 110 , 20 , WEST)
    g.addEdge(111, 112, 40 , NORTH);////////////
    g.addEdge(112, 113, 20 , WEST);
    g.addEdge(111, 114, 40 , SOUTH);////////////
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
    g.addEdge(110, 144, 40 , UP);//free
    g.addEdge(144, 145, 20 , EAST);
    g.addEdge(145, 146, 40 , NORTH);
    g.addEdge(145, 147, 40 , SOUTH);
    g.addEdge(146, 148, 20 , WEST);
    g.addEdge(138, 149, 40 , UP);//free
    g.addEdge(137, 152, 40 , UP);//extra67
    g.addEdge(113, 148 , 40 , UP);//extra67
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
    g.addEdge(168, 162, 110 , EAST);
    g.addEdge(169, 170, 90 , SOUTH);
    g.addEdge(10, 171, 130 , EAST);
    g.addEdge(171, 172, 10 , NORTH);
    g.addEdge(170, 172 , 40 , UP);//EA Stairs level 1 -2 
    g.addEdge(171, 173, 30 , SOUTH);
    g.addEdge(173, 174, 40 , UP); //level 2- 3
    g.addEdge(174, 175, 30 , SOUTH);
    g.addEdge(167, 31 , 40 , UP);//extra12
    g.addEdge(166, 27 , 40 , UP);//extra12
    g.addEdge(154, 23 , 40 , UP);//extra12
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
    g.addEdge(130, 189, 40 , EAST);//closed loop EA floor 6 to E1A
    g.addEdge(246, 242, 95 , EAST);//closed loop EA floor 7 to E1A
    g.addEdge(187, 192, 40 , UP);
    g.addEdge(192, 193, 20 , NORTH);
    g.addEdge(193, 194, 20 , EAST);
    g.addEdge(194, 195, 25 , NORTH);
    g.addEdge(195, 196, 20 , WEST);
    g.addEdge(192, 197, 40 , UP);
    g.addEdge(197, 198, 25 , NORTH);
    g.addEdge(198, 199, 20 , WEST);
    g.addEdge(197, 200, 40 , UP);
    g.addEdge(200, 201, 25 , NORTH);
    g.addEdge(201, 202, 20 , WEST);
    g.addEdge(200, 203, 40 , UP);
    g.addEdge(203, 204, 25 , NORTH);
    g.addEdge(204, 205, 20 , WEST);
    g.addEdge(187, 206, 40 , DOWN);
    g.addEdge(206, 207, 25 , NORTH);
    g.addEdge(207, 208, 20 , WEST);
    g.addEdge(208, 183, 40 , UP);//E1A FLOOR 2-3 stairs
    g.addEdge(183, 196 , 40 , UP);//E1A FLOOR 3-4 stairs
    g.addEdge(196, 199 , 40 , UP);//E1A FLOOR 4-5 stairs
    g.addEdge(199, 202 , 40 , UP);//E1A FLOOR 5-6 stairs
    g.addEdge(202, 205 , 40 , UP);//E1A FLOOR 6-7 stairs
    g.addEdge(237, 226 , 40 , UP);//E1A FLOOR 5-6 stairs
    g.addEdge(226, 221 , 40 , UP);//E1A FLOOR 6-7 stairs
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
    g.addEdge(239, 249, 50 , NORTH);
    g.addEdge(249, 250, 65 , EAST);
    g.addEdge(250, 251, 180 , NORTH);
    g.addEdge(251, 252, 260 , WEST);
    g.addEdge(252, 253, 40 , NORTH);
    g.addEdge(178, 253, 40 , UP);//level 6 - 7 connect dean office
    g.addEdge(250, 254, 125 , EAST);
    g.addEdge(254, 255, 20 , SOUTH);
    g.addEdge(254, 256, 15 , EAST);
    g.addEdge(256, 257, 20 , SOUTH);
    g.addEdge(256, 258, 230 , EAST);
    g.addEdge(258, 259, 20 , SOUTH);
    g.addEdge(258, 260, 40 , EAST);
    g.addEdge(261 , 237 , 40 , UP);//E1A FLOOR 4-5 stairs alleyside
    g.addEdge(260, 261, 210 , SOUTH);
    g.addEdge(260, 262, 300 , EAST);
    g.addEdge(262, 263, 55 , NORTH);
    g.addEdge(263, 264, 30 , EAST);
    g.addEdge(263, 265, 30 , WEST);
    g.addEdge(265, 266, 40 , UP);
    g.addEdge(266, 267, 30 , EAST);
    g.addEdge(267, 268, 30 , EAST);
    g.addEdge(266, 269, 40 , UP);
    g.addEdge(269, 270, 30 , EAST);
    g.addEdge(270, 271, 30 , EAST);
    g.addEdge(269, 272, 40 , UP);
    g.addEdge(272, 273, 30 , EAST);
    g.addEdge(273, 274, 30 , EAST);
    g.addEdge(272, 275, 40 , UP);
    g.addEdge(275, 276, 30 , EAST);
    g.addEdge(276, 277, 30 , EAST);
    g.addEdge(275, 278, 40 , UP);
    g.addEdge(278, 279, 30 , EAST);
    g.addEdge(279, 280, 30 , EAST);
    g.addEdge(236, 281, 40 , NORTH);
    g.addEdge(281, 282, 305 , EAST);
    g.addEdge(282, 267, 45 , NORTH);//closed loop E1 LEVEL 5
    g.addEdge(282 , 297 , 45 , SOUTH);
    g.addEdge(264, 268, 40 , UP); //E1 stairs level  B - 1
    g.addEdge(268, 271, 40 , UP); //E1 stairs level  1 - 2
    g.addEdge(271, 274, 40 , UP); //E1 stairs level  2 - 3
    g.addEdge(274, 277, 40 , UP); //E1 stairs level  3 - 4
    g.addEdge(277, 280, 40 , UP); //E1 stairs level  4 - 5
    g.addEdge(262, 283, 50 , SOUTH);
    g.addEdge(283, 284, 20 , WEST);
    g.addEdge(283, 285, 40 , SOUTH);
    g.addEdge(285, 286, 70 , EAST);
    g.addEdge(286, 287, 20 , NORTH);
    g.addEdge(286, 288, 40 , EAST);
    g.addEdge(288, 289, 20 , SOUTH);
    g.addEdge(288, 290, 55 , EAST);
    g.addEdge(290, 291, 20 , NORTH);
    g.addEdge(290, 292, 80 , EAST);
    g.addEdge(292, 293, 20 , NORTH);
    g.addEdge(292, 294, 80 , EAST);
    g.addEdge(294, 295, 50 , EAST);
    g.addEdge(295, 296, 95 , NORTH);
    g.addEdge(262, 296, 375 , EAST);////closed loop E1 LEVEL B1
    g.addEdge(297, 298, 640 , EAST);
    g.addEdge(298, 299, 155 , SOUTH);
    g.addEdge(299, 300, 20 , EAST);
    g.addEdge(299, 301, 30 , SOUTH);
    g.addEdge(301, 302, 30 , WEST);
    g.addEdge(296, 303, 260 , EAST);
    g.addEdge(303, 304, 215 , SOUTH);
    g.addEdge(304, 305, 30 , EAST);
    g.addEdge(304, 306, 30 , SOUTH);
    g.addEdge(306, 307, 30 , WEST);
    g.addEdge(270, 308, 130 , SOUTH);
    g.addEdge(308, 309, 20 , WEST);
    g.addEdge(308, 310, 15 , SOUTH);
    g.addEdge(310, 311, 20 , WEST);
    g.addEdge(310, 312, 20 , EAST);
    g.addEdge(308, 313, 40 , EAST);
    g.addEdge(313, 314, 20 , NORTH);
    g.addEdge(313, 315, 75 , EAST);
    g.addEdge(315, 316, 20 , NORTH);
    g.addEdge(315, 317, 20 , SOUTH);
    g.addEdge(315, 318, 80 , EAST);
    g.addEdge(318, 319, 20 , NORTH);
    g.addEdge(318, 320, 20 , SOUTH);
    g.addEdge(318, 321, 70 , EAST);
    g.addEdge(321, 322, 20 , SOUTH);
    g.addEdge(321, 323, 20 , NORTH);
    g.addEdge(321, 324, 80 , EAST);
    g.addEdge(324, 325, 20 , NORTH);
    g.addEdge(324, 326, 20 , SOUTH);
    g.addEdge(324, 327, 80 , EAST);
    g.addEdge(327, 328, 20 , NORTH);
    g.addEdge(327, 329, 20 , SOUTH);
    g.addEdge(327, 330, 80 , EAST);
    g.addEdge(330, 331, 20 , SOUTH);
    g.addEdge(330, 332, 20 , NORTH);
    g.addEdge(330, 333, 115 , EAST);
    g.addEdge(333, 334, 155 , SOUTH);
    g.addEdge(334, 335, 30 , EAST);
    g.addEdge(334, 336, 25 , SOUTH);
    g.addEdge(336, 337, 30 , WEST);
    g.addEdge(273, 338, 165 , SOUTH);
    g.addEdge(338, 339, 20 , WEST);
    g.addEdge(338, 340, 25 , EAST);
    g.addEdge(340, 341, 20 , NORTH);
    g.addEdge(340, 342, 185 , EAST);
    g.addEdge(342, 343, 20 , NORTH);
    g.addEdge(342, 344, 160 , EAST);
    g.addEdge(344, 345, 20 , NORTH);
    g.addEdge(344, 346, 160 , EAST);
    g.addEdge(346, 347, 20 , NORTH);
    g.addEdge(346, 348, 110 , EAST);
    g.addEdge(348, 349, 20 , NORTH);
    g.addEdge(348, 350, 110 , SOUTH);
    g.addEdge(350, 351, 30 , EAST);
    g.addEdge(350, 352, 25 , SOUTH);
    g.addEdge(352, 353, 30 , WEST);
    g.addEdge(337 , 353, 40 , UP);//////E1 elevator floor 6 -7 
    g.addEdge(335 , 351, 40 , UP);//////E1 stairs floor 6 -7
    g.addEdge(302 , 337, 40 , UP);//////E1 elevator floor 5 - 6 
    g.addEdge(300 , 335, 40 , UP);//////E1 stairs floor 5 - 6
    g.addEdge(307 , 302 , 40 , UP);//////E1 elevator floor 4 - 5 
    g.addEdge(305 , 300 , 40 , UP);//////E1 stairs floor 4 - 5
    /*
    g.addEdge(276, 354, 150 , SOUTH);
    g.addEdge(354, 355, 30 , WEST);
    g.addEdge(354, 356, 30 , EAST);
    g.addEdge(354, 357, 15 , SOUTH);
    g.addEdge(357, 358, 40 , WEST);
    g.addEdge(357, 359, 210 , EAST);
    g.addEdge(359, 360, 20 , NORTH);
    g.addEdge(359, 361, 165 , EAST);
    g.addEdge(361, 362, 20 , NORTH);
    g.addEdge(361, 363, 270 , EAST);
    g.addEdge(363, 364, 110 , SOUTH);
    g.addEdge(364, 365, 20 , EAST);
    g.addEdge(351, 365, 40 , UP);
    g.addEdge(270, 366, 195 , NORTH);
    g.addEdge(366, 367, 65 , WEST);
    g.addEdge(367, 368, 45 , SOUTH);
    g.addEdge(368, 369, 175 , WEST);
    g.addEdge(369, 370, 30 , NORTH);
    g.addEdge(370, 371, 390 , WEST);
    g.addEdge(371, 372, 125 , NORTH);
    g.addEdge(372, 373, 20 , WEST);
    g.addEdge(273, 374, 195 , NORTH);
    g.addEdge(374, 375, 20 , EAST);
    g.addEdge(374, 376, 20 , NORTH);
    g.addEdge(376, 377, 20 , WEST);
    g.addEdge(377, 378, 20 , SOUTH);
    g.addEdge(377, 379, 320 , WEST);
    g.addEdge(379, 380, 20 , SOUTH);
    g.addEdge(379, 381, 120 , WEST);
    g.addEdge(381, 382, 20 , SOUTH);
    g.addEdge(381, 383, 120 , WEST);
    g.addEdge(383, 384, 20 , SOUTH);
    g.addEdge(383, 385, 55 , WEST);
    g.addEdge(385, 386, 65 , WEST);
    g.addEdge(385, 387, 20 , SOUTH);
    g.addEdge(385, 388, 110 , NORTH);
    g.addEdge(388, 389, 20 , WEST);
    g.addEdge(373, 389, 40 , UP); //E2 level 2-3 stairs
    g.addEdge(279, 390, 150 , NORTH);
    g.addEdge(390, 391, 70 , NORTH);
    g.addEdge(303, 392, 60 , NORTH);
    g.addEdge(392, 393, 190 , NORTH);
    g.addEdge(393, 394, 140 , NORTH);
    g.addEdge(394, 395, 25 , NORTH);
    g.addEdge(395, 396, 20 , EAST);
    g.addEdge(396, 397, 40 , UP);
    g.addEdge(397, 398, 20 , WEST);
    g.addEdge(398, 399, 25 , SOUTH);
    g.addEdge(399, 400, 20 , EAST);
    g.addEdge(394, 401, 20 , EAST);
    g.addEdge(401, 400, 40 , UP);
    g.addEdge(397, 402, 40 , UP);
    g.addEdge(402, 403, 20 , WEST);
    g.addEdge(403, 404, 25 , SOUTH);
    g.addEdge(404, 333, 430 , SOUTH);
    g.addEdge(400, 405, 40 , UP);
    g.addEdge(404, 405, 20 , EAST);
    g.addEdge(402, 406, 40 , UP);
    g.addEdge(406, 407, 20 , WEST);
    g.addEdge(407, 408, 25 , SOUTH);
    g.addEdge(405, 409, 40 , UP);
    g.addEdge(408, 409, 20 , EAST);
    g.addEdge(406, 410, 40 , UP);
    g.addEdge(410, 411, 20 , WEST);
    g.addEdge(411, 412, 25 , SOUTH);
    g.addEdge(409, 413, 40 , UP);
    g.addEdge(412, 413, 20 , EAST);
    g.addEdge(411, 414, 150 , NORTH);
    g.addEdge(414, 415, 20 , WEST);
    g.addEdge(414, 416, 20 , EAST);
    g.addEdge(414, 417, 85 , NORTH);
    g.addEdge(417, 418, 340 , WEST);
    g.addEdge(418, 419, 20 , SOUTH);
    g.addEdge(418, 420, 60 , WEST);
    g.addEdge(420, 421, 20 , SOUTH);
    g.addEdge(420, 422, 115 , NORTH);
    g.addEdge(455, 423, 40 , UP);
    g.addEdge(422, 423, 30 , EAST);
    g.addEdge(417, 424, 95 , EAST);
    g.addEdge(424, 425, 345 , NORTH);
    g.addEdge(425, 426, 20 , EAST);
    g.addEdge(425, 427, 50 , NORTH);
    g.addEdge(427, 428, 100 , WEST);
    g.addEdge(428, 429, 20 , SOUTH);
    g.addEdge(428, 430, 25 , WEST);
    g.addEdge(447, 431, 40 , UP);
    g.addEdge(430, 431, 30 , SOUTH);
    g.addEdge(407, 432, 235 , NORTH);
    g.addEdge(432, 433, 20 , EAST);
    g.addEdge(433, 434, 20 , SOUTH);
    g.addEdge(433, 435, 55 , EAST);
    g.addEdge(435, 436, 30 , NORTH);
    g.addEdge(436, 437, 100 , NORTH);
    g.addEdge(437, 438, 20 , EAST);
    g.addEdge(437, 439, 145 , NORTH);
    g.addEdge(439, 440, 20 , EAST);
    g.addEdge(439, 441, 20 , NORTH);
    g.addEdge(441, 442, 20 , EAST);
    g.addEdge(441, 443, 85 , NORTH);
    g.addEdge(443, 444, 70 , WEST);
    g.addEdge(444, 445, 20 , SOUTH);
    g.addEdge(444, 446, 25 , WEST);
    g.addEdge(446, 447, 30 , SOUTH);
    g.addEdge(472, 447, 40 , UP);
    g.addEdge(432, 448, 20 , WEST);
    g.addEdge(448, 449, 20 , SOUTH);
    g.addEdge(448, 450, 50 , WEST);
    g.addEdge(450, 451, 20 , SOUTH);
    g.addEdge(450, 452, 220 , WEST);
    g.addEdge(452, 453, 20 , SOUTH);
    g.addEdge(452, 454, 90 , NORTH);
    g.addEdge(464, 455, 40 , UP);
    g.addEdge(454, 455, 20 , EAST);
    g.addEdge(403, 456, 120 , NORTH);
    g.addEdge(456, 457, 20 , WEST);
    g.addEdge(456, 458, 40 , NORTH);
    g.addEdge(458, 459, 20 , EAST);
    g.addEdge(458, 460, 40 , NORTH);
    g.addEdge(460, 461, 320 , WEST);
    g.addEdge(461, 462, 20 , SOUTH);
    g.addEdge(461, 463, 120 , NORTH);
    g.addEdge(463, 464, 20 , EAST);
    g.addEdge(460, 465, 40 , NORTH);
    g.addEdge(465, 466, 80 , EAST);
    g.addEdge(466, 467, 310 , NORTH);
    g.addEdge(467, 468, 20 , EAST);
    g.addEdge(467, 469, 65 , NORTH);
    g.addEdge(469, 470, 65 , WEST);
    g.addEdge(467, 471, 25 , WEST);
    g.addEdge(471, 472, 20 , SOUTH);
    g.addEdge(398, 473, 195 , NORTH);
    g.addEdge(473, 474, 100 , EAST);
    g.addEdge(395, 475, 150 , NORTH);
    g.addEdge(475, 476, 135 , WEST);
    g.addEdge(476, 477, 200 , WEST);
    g.addEdge(477, 478, 305 , WEST);
    g.addEdge(478, 479, 20 , WEST);
    g.addEdge(478, 480, 245 , NORTH);
    g.addEdge(480, 481, 20 , EAST);
    */
    return g;
}
