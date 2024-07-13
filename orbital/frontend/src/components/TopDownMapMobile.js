import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import ArrowIcon from './ArrowIcon';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import SvgIcon from '@mui/material';
const svgwidth = 600;
const svgheight = 400

const TopDownMapMobile = ({ nodes, visited, originNodeId, nodesPath, stopsIndex, submitTrigger }) => {

  <svg width="0" height="0" style="position:absolute; overflow: hidden;">
    <symbol id="arrow-icon" viewBox="0 0 24 24">
      <path d="M10 17l5-5-5-5v10z" />
    </symbol>
  </svg>


  const nodesForStopsString = stopsIndex.map(index => nodesPath[index]);
  const nodesForStops = nodesForStopsString.map(num => parseInt(num, 10));
  const visitedNum = visited.map(num => parseInt(num, 10));
  const path = nodesPath.map(num => parseInt(num, 10));
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

        <svg width={"100%"} height={"100%"} viewBox="0 0 600 400" style={{ border: '1px solid gray' }}>
          {/* For Map Layout */}
          {nodes.map(node => (
            <g key={node.id}>
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
            <g key={`2nd layer-${node.id}`}>
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
            <g key={node.id}>
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
                      key={`4th layer-${node.id}-${connectedNode.id}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        (visitedNum.includes(node.id) && visitedNum.includes(connection.id)) ? 'grey' :
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
                key={`5th layer-${node.id}`}
                cx={nodePositions.get(node.id)?.x || 0}
                cy={nodePositions.get(node.id)?.y || 0}
                r="6"
                fill={'black'}
                fillOpacity={((node.label == "Elevator") || (node.label == "Stairs")) ? "0" : (path.includes(node.id)) ? "1" : "0"}
              />
              <circle
                key={`6th layer-${node.id}`}
                cx={nodePositions.get(node.id)?.x || 0}
                cy={nodePositions.get(node.id)?.y || 0}
                r="5"
                fill={node.id === originNodeId ? '#0076EA' : (nodesPath[0] == node.id) ? '#B0151B' : (nodesForStops.includes(node.id)) ? '#6ACF1E' : (visitedNum.includes(node.id)) ? 'grey' : '#cdd8e6'}
                fillOpacity={((node.label == "Elevator") || (node.label == "Stairs")) ? "0" : (path.includes(node.id)) ? "1" : "0"}
              />
              <rect
                key={`7th layer-${node.id}`}
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

              <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M8.5,6c0.69,0,1.25,0.56,1.25,1.25 c0,0.69-0.56,1.25-1.25,1.25S7.25,7.94,7.25,7.25C7.25,6.56,7.81,6,8.5,6z M11,14h-1v4H7v-4H6v-2.5c0-1.1,0.9-2,2-2h1 c1.1,0,2,0.9,2,2V14z M15.5,17L13,13h5L15.5,17z M13,11l2.5-4l2.5,4H13z" transform={`translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0}) scale(0.9)`} fill={(node.id === originNodeId)
                    ? '#0076EA' :(path.includes(node.id)) ? "green" : "black"} fillOpacity={(node.label == "Elevator") ? "1" : "0"} />
              <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M17,8h-1.42v3.33H13v3.33h-2.58 L10.45,18H7c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1h1.42v-3.33H11V9.33h2.58V6H17c0.55,0,1,0.45,1,1C18,7.55,17.55,8,17,8z" transform={`translate(${nodePositions.get(node.id)?.x - 10 || 0}, ${nodePositions.get(node.id)?.y - 10.4 || 0}) scale(0.9)`} fill={(node.id === originNodeId)
                    ? '#0076EA' :(path.includes(node.id)) ? "green" : "black"} fillOpacity={(node.label == "Stairs") ? "1" : "0"}/>



            </>))}

        </svg>
      <br />
    </>
  );
};

export default TopDownMapMobile;