import React from 'react';

const GraphVisualization = ({ graphnodes }) => {
  return (
    <svg width="10000" height="10000">
      {/* Render nodes */}
      {graphnodes.map(node => (
        <circle key={node.id} cx={node.id * 50} cy={100} r={10} fill="blue" />
      ))}

      {/* Render connections */}
      {graphnodes.map(node => (
        node.connections.map(connection => (
          <line key={`${node.id}-${connection.id}`} 
                x1={node.id * 50} y1={100} 
                x2={connection.id * 50} y2={100} 
                stroke="black" />
        ))
      ))}
    </svg>
  );
};

export default GraphVisualization;