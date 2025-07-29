import { memo } from 'react';
import { getStraightPath, EdgeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

interface GraphEdgeData {
  isActive?: boolean;
  isVisited?: boolean;
  isDirected?: boolean;
}

export const GraphEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {},
}: EdgeProps) => {
  const edgeData = data as GraphEdgeData;

  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const getStrokeColor = () => {
    if (edgeData?.isActive) return '#2563eb';
    if (edgeData?.isVisited) return '#10b981';
    return '#6b7280';
  };

  // Calculate arrow position and angle for directed edges
  const arrowSize = 8;
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const nodeRadius = 25; // Adjust based on node size
  const arrowX = targetX - Math.cos(angle) * nodeRadius;
  const arrowY = targetY - Math.sin(angle) * nodeRadius;

  const arrowAngle1 = angle - Math.PI / 6;
  const arrowAngle2 = angle + Math.PI / 6;
  const arrowPoint1X = arrowX - arrowSize * Math.cos(arrowAngle1);
  const arrowPoint1Y = arrowY - arrowSize * Math.sin(arrowAngle1);
  const arrowPoint2X = arrowX - arrowSize * Math.cos(arrowAngle2);
  const arrowPoint2Y = arrowY - arrowSize * Math.sin(arrowAngle2);

  return (
    <g>
      <motion.path
        id={id}
        style={style}
        className="react-flow__edge-path transition-all duration-300"
        d={edgePath}
        strokeDasharray={edgeData?.isActive ? "5,5" : "none"}
        stroke={getStrokeColor()}
        strokeWidth={edgeData?.isActive ? 3 : 2}
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {edgeData?.isDirected && (
        <motion.polygon
          points={`${arrowX},${arrowY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
          fill={getStrokeColor()}
          stroke={getStrokeColor()}
          strokeWidth="1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      )}
    </g>
  );
});

GraphEdge.displayName = 'GraphEdge';
