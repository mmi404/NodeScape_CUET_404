import { memo } from 'react';
import { getStraightPath, EdgeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

interface GraphEdgeData {
  isActive?: boolean;
}

export const GraphEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}: EdgeProps) => {
  const edgeData = data as unknown as GraphEdgeData;
  
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
          fill={edgeData?.isActive ? '#2563eb' : '#9ca3af'}
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      <motion.path
        id={id}
        style={style}
        className={`react-flow__edge-path ${
          edgeData?.isActive 
            ? 'stroke-edge-active stroke-2 animate-flow-edge' 
            : 'stroke-edge-default stroke-1'
        } transition-all duration-300`}
        d={edgePath}
        strokeDasharray={edgeData?.isActive ? "5,5" : "none"}
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </>
  );
});

GraphEdge.displayName = 'GraphEdge';
