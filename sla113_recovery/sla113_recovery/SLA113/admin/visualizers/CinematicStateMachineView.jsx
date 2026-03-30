import React from 'react';

export const CinematicStateMachineView = ({ currentState }) => {
  const nodes = [
    { id: 'IDLE', x: 50, y: 150 },
    { id: 'BUILD', x: 200, y: 50 },
    { id: 'CREST', x: 350, y: 150 },
    { id: 'RELEASE', x: 200, y: 250 }
  ];

  return (
    <div className="state-machine-container">
      <svg width="400" height="300" className="glass-panel">
        {nodes.map(node => (
          <g key={node.id}>
            <circle 
              cx={node.x} cy={node.y} r="30" 
              fill={currentState === node.id ? "#00C8FF" : "#1a1a1a"}
              stroke="#e2e2e2" strokeWidth="1"
            />
            <text x={node.x} y={node.y + 5} textAnchor="middle" fill="#fff" fontSize="10">
              {node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
