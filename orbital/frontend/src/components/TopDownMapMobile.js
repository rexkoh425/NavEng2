import React from 'react';
import { useState } from "react"
import Button from '@mui/material/Button';

const svgwidth = 600;
const svgheight = 275

const TopDownMapMobile = ({ nodes, visited, originNodeId, nodesPath, stopsIndex, Node_id_array, blockedIMGName }) => {

  const [enableRotation, setEnableRotation] = useState(false);
  const [buttonContent, setButtonContent] = useState("Enable Map Rotation");

  const toggleRotation = () => {
    setEnableRotation(!enableRotation)
    if (enableRotation) {
      setButtonContent("Enable Map Rotation")
    }
    else {
      setButtonContent("Disable Map Rotation")
    }
  }

  console.log("Blocked Img name: " + blockedIMGName)
  //For debugging
  console.log("nodes" + nodes);
  console.log("visited" + visited);
  console.log("originNodeID" + nodesPath);
  console.log("stopsIndex" + stopsIndex);

  function getConnectedNode(nodeId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error(`Node with ID ${nodeId} not found.`);
      return null;
    }

    const connectedNode = node.connections.find(connection => {
      const connectedNode = nodes.find(n => n.id === connection.id);
      return connectedNode !== undefined;
    });

    return connectedNode ? connectedNode.id : null;
  }
  function identifyDirection(nodeId1, nodeId2, nodes) {
    const node1 = nodes.find(node => node.id === nodeId1);
    if (!node1) {
      console.error(`Node with ID ${nodeId1} not found.`);
      return null;
    }

    const connection = node1.connections.find(conn => conn.id === nodeId2);
    if (!connection) {
      console.error(`No connection found from node ${nodeId1} to node ${nodeId2}.`);
      return null;
    }

    return connection.direction;
  }


  const nodesForStopsString = stopsIndex.map(index => nodesPath[index]);
  const nodesForStops = nodesForStopsString.map(num => parseInt(num, 10));
  console.log("nodes for stops: " + nodesForStops)
  const visitedNum = visited.map(num => parseInt(num, 10));
  const path = nodesPath.map(num => parseInt(num, 10));
  const uncompressedpath = Node_id_array.map(num => parseInt(num, 10));


  function break_down_img_path(img_name) {

    let increment = 0;
    const components = img_name.split("_");
    const node_id = components[0];
    const x_coor = components[1];
    const y_coor = components[2];
    const z_coor = components[3];
    const pov = components[4];
    const arrow_dir = components[5];
    let type = components[6];
    if (components[6] == "T" || components[6] == "Cross") {
      type = components[6] + "_" + components[7];
      increment = 1;
    }
    const room_num = components[7 + increment];
    return { node_id: node_id, x_coor: x_coor, y_coor: y_coor, z_coor: z_coor, pov: pov, arrow: arrow_dir, type: type, room_num: room_num };

  }

  const NodeDetails = break_down_img_path(blockedIMGName)


  let rotationAngle = 0;
  if (NodeDetails.pov === "South") {
    rotationAngle = 0;
  }
  else if (NodeDetails.pov === "East") {
    rotationAngle = 90;
  }
  else if (NodeDetails.pov === "North") {
    rotationAngle = 180;
  }
  else if (NodeDetails.pov === "West") {
    rotationAngle = 270;
    console.log(NodeDetails.pov)

  } else {
    let directionBetweenNode = ""
    const connectedNode = getConnectedNode(originNodeId, nodes)
    console.log("connected node: " + connectedNode)
    directionBetweenNode = identifyDirection(connectedNode, originNodeId, nodes)
    console.log("nodes for stops" + nodesForStops)
    console.log("direction43: " + directionBetweenNode)
    if (directionBetweenNode === "south") {
      rotationAngle = 0;
    }
    else if (directionBetweenNode === "east") {
      rotationAngle = 90;
    }
    else if (directionBetweenNode === "north") {
      rotationAngle = 180;
    }
    else {
      rotationAngle = 270;
      console.log(NodeDetails.pov)

    }
  }

  function NewVisited(Node_id_array, originNodeId) {
    let NewestVisited = [];

    for (let elem of Node_id_array) {
      if (elem === originNodeId) {
        NewestVisited.push(elem);
        break;
      }
      NewestVisited.push(elem);
    }

    return NewestVisited;
  }

  let NewestVisited = NewVisited(uncompressedpath, originNodeId)
  const calculateNodePositions = (originNodeId) => {
    const calculatedPositions = new Map();
    const originNode = nodes.find(node => node.id === originNodeId);

    if (!originNode) {
      //  console.error(`Origin node with id ${originNodeId} not found in nodes.`);
      return calculatedPositions;
    }

    const originX = svgwidth / 2;
    const originY = svgheight / 2;
    calculatedPositions.set(originNode.id, { x: originX, y: originY });

    const calculatePosition = (startX, startY, direction, distance) => {
      let x = startX;
      let y = startY;

      switch (direction) {
        case 'south':
          y -= distance;
          break;
        case 'north':
          y += distance;
          break;
        case 'west':
          x += distance;
          break;
        case 'east':
          x -= distance;
          break;
        default:
          break;
      }

      return { x, y };
    };

    const calculateNodePositionsRecursive = (node, parentPosition) => {
      node.connections.forEach(connection => {
        const connectedNode = nodes.find(n => n.id === connection.id);
        if (connectedNode && !calculatedPositions.has(connectedNode.id)) {
          const { x, y } = calculatePosition(parentPosition.x, parentPosition.y, connection.direction, connection.distance);
          calculatedPositions.set(connectedNode.id, { x, y });
          calculateNodePositionsRecursive(connectedNode, { x, y });
        }
      });
    };

    calculateNodePositionsRecursive(originNode, { x: originX, y: originY });

    return calculatedPositions;
  };

  //const [nodePositions, setNodePositions] = useState(new Map());
  const nodePositions = calculateNodePositions(originNodeId);

  return (
    <>
    <Button variant="contained" onClick={toggleRotation} sx={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend", margin: "5px" }}>{buttonContent}</Button>
      <svg width={"100%"} height={"100%"} viewBox={`0 0 ${svgwidth} ${svgheight}`} style={{ border: '1px solid gray' }}>
        {/* For Map Layout */}
        {nodes.map(node => (
          <g key={node.id} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}>
            <circle cx={nodePositions.get(node.id)?.x || 0} cy={nodePositions.get(node.id)?.y || 0} r="11.5" fill={'grey'} />
            {node.connections.map(connection => {
              const connectedNode = nodes.find(n => n.id === connection.id);
              if (!connectedNode) return null;

              // Get positions for the nodes
              const x1 = nodePositions.get(node.id)?.x || 0;
              const y1 = nodePositions.get(node.id)?.y || 0;
              const x2 = nodePositions.get(connectedNode.id)?.x || 0;
              const y2 = nodePositions.get(connectedNode.id)?.y || 0;

              return (
                <>
                  <line
                    key={`${node.id}-${connectedNode.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      (visitedNum.includes(node.id) && visitedNum.includes(connection.id)) ? 'grey' :
                        'grey'
                    } strokeWidth="22"
                  />
                </>
              );

            })}
          </g>
        ))}

        {nodes.map(node => (
          <g key={`2nd layer-${node.id}`} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}>
            <circle cx={nodePositions.get(node.id)?.x || 0} cy={nodePositions.get(node.id)?.y || 0} r="10" fill={'lightgrey'} />
            <circle cx={nodePositions.get(node.id)?.x || 0} cy={nodePositions.get(node.id)?.y || 0} r="5" fill={node.id === originNodeId ? 'purple' : 'blue'} fillOpacity={(path.includes(node.id)) ? "1" : "0"} />
            {node.connections.map(connection => {
              const connectedNode = nodes.find(n => n.id === connection.id);
              if (!connectedNode) return null;

              // Get positions for the nodes
              const x1 = nodePositions.get(node.id)?.x || 0;
              const y1 = nodePositions.get(node.id)?.y || 0;
              const x2 = nodePositions.get(connectedNode.id)?.x || 0;
              const y2 = nodePositions.get(connectedNode.id)?.y || 0;

              return (
                <>
                  <line
                    key={`3rd layer-${node.id}-${connectedNode.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      'lightgrey'
                    } strokeWidth="20"
                  />
                </>
              );

            })}
          </g>
        ))}

        {nodes.map(node => (
          <g key={node.id} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}>
            {node.connections.map(connection => {
              const connectedNode = nodes.find(n => n.id === connection.id);
              if (!connectedNode) return null;

              // Get positions for the nodes
              const x1 = nodePositions.get(node.id)?.x || 0;
              const y1 = nodePositions.get(node.id)?.y || 0;
              const x2 = nodePositions.get(connectedNode.id)?.x || 0;
              const y2 = nodePositions.get(connectedNode.id)?.y || 0;

              return (
                <>
                  <line
                    key={`9th layer-${node.id}-${connectedNode.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      (NewestVisited.includes(node.id) && NewestVisited.includes(connection.id)) ? 'grey' :
                        (uncompressedpath.includes(node.id) && uncompressedpath.includes(connection.id)) ? '#F05C2C' :
                          'lightgrey'
                    } strokeWidth="5"
                    strokeOpacity={(path.includes(node.id) && uncompressedpath.includes(connection.id)) ? '1' :
                      '0'}
                  />
                  <line
                    key={`4th layer-${node.id}-${connectedNode.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      (NewestVisited.includes(node.id) && visitedNum.includes(connection.id)) ? 'grey' :
                        (path.includes(node.id) && path.includes(connection.id)) ? '#F05C2C' :
                          'lightgrey'
                    } strokeWidth="5"
                    strokeOpacity={(path.includes(node.id) && path.includes(connection.id)) ? '1' :
                      '0'}
                  />
                </>
              );

            })}
          </g>
        ))}

        {nodes.map(node => (
          <>
            <circle
              key={`5th layer-${node.id}`} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}
              cx={nodePositions.get(node.id)?.x || 0}
              cy={nodePositions.get(node.id)?.y || 0}
              r="6"
              fill={'black'}
              fillOpacity={((node.label == "Elevator") || (node.label == "Stairs")) ? "0" : (path.includes(node.id)) ? "1" : "0"}
            />
            <circle
              key={`6th layer-${node.id}`} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}
              cx={nodePositions.get(node.id)?.x || 0}
              cy={nodePositions.get(node.id)?.y || 0}
              r="5"
              fill={node.id === originNodeId ? '#0076EA' : (nodesPath[0] == node.id) ? '#B0151B' : (nodesForStops.includes(node.id)) ? '#6ACF1E' : (visitedNum.includes(node.id)) ? 'grey' : '#cdd8e6'}
              fillOpacity={((node.label == "Elevator") || (node.label == "Stairs")) ? "0" : (path.includes(node.id)) ? "1" : "0"}
            />
            <rect
              key={`7th layer-${node.id}`} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}
              x={nodePositions.get(node.id)?.x - 5 || 0} // Adjust x position for rectangle (left corner)
              y={nodePositions.get(node.id)?.y - 5 || 0} // Adjust y position for rectangle (top corner)
              width="12" // Width of the rectangle
              height="12" // Height of the rectangle
              fill={
                nodesPath[0] === node.id
                  ? '#B0151B'
                  : nodesForStops.includes(node.id)
                    ? '#6ACF1E'
                    : 'white'
              }
              fillOpacity={
                (node.label === "Elevator" || node.label === "Stairs")
                  ? "1"
                  : path.includes(node.id)
                    ? "0"
                    : "0"
              }
            />

<g key={node.id} transform={enableRotation ? `rotate(${rotationAngle} ${svgwidth / 2} ${svgheight / 2})` : `none`}>
              <path
                d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M8.5,6c0.69,0,1.25,0.56,1.25,1.25 c0,0.69-0.56,1.25-1.25,1.25S7.25,7.94,7.25,7.25C7.25,6.56,7.81,6,8.5,6z M11,14h-1v4H7v-4H6v-2.5c0-1.1,0.9-2,2-2h1 c1.1,0,2,0.9,2,2V14z M15.5,17L13,13h5L15.5,17z M13,11l2.5-4l2.5,4H13z"
                transform={enableRotation ? `
      translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0})
      scale(0.9)
      rotate(${-rotationAngle} ${10.7} ${11.5})` : `translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0})
      scale(0.9)`} // Adjust the rotation center as needed
                fill={(node.id === originNodeId) ? '#0076EA' : (path.includes(node.id)) ? "green" : "black"}
                fillOpacity={(node.label === "Elevator") ? "1" : "0"} />

              <path
                d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M17,8h-1.42v3.33H13v3.33h-2.58 L10.45,18H7c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1h1.42v-3.33H11V9.33h2.58V6H17c0.55,0,1,0.45,1,1C18,7.55,17.55,8,17,8z"
                transform={enableRotation ? `
      translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0})
      scale(0.9)
      rotate(${-rotationAngle} ${10.7} ${11.5})` : `translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0})
      scale(0.9)`} // Adjust the rotation center as needed
                fill={(node.id === originNodeId) ? '#0076EA' : (path.includes(node.id)) ? "green" : "black"}
                fillOpacity={(node.label === "Stairs") ? "1" : "0"} />
            </g>



          </>))}

      </svg>
      <br />
    </>
  );
};

export default TopDownMapMobile;