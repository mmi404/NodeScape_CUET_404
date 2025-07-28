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
    <motion.path
      id={id}
      style={style}
      className={`react-flow__edge-path transition-all duration-300`}
      d={edgePath}
      strokeDasharray={edgeData?.isActive ? "5,5" : "none"}
      stroke={edgeData?.isActive ? '#2563eb' : '#374151'}
      strokeWidth={edgeData?.isActive ? 4 : 3}
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
    />
  );
});

GraphEdge.displayName = 'GraphEdge';
