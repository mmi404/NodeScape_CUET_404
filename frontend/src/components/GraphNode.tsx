import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GraphNodeData {
  label: string;
  isVisited?: boolean;
  isCurrent?: boolean;
  isQueued?: boolean;
}


interface GraphNodeProps extends NodeProps {
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
}

export const GraphNode = memo(({ data, selected, onContextMenu }: GraphNodeProps) => {
  const nodeData = data as unknown as GraphNodeData;

  const getNodeStyle = () => {
    if (nodeData.isCurrent) {
      return 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/50';
    }
    if (nodeData.isVisited) {
      return 'bg-green-600 border-green-600 shadow-green-500/50';
    }
    if (nodeData.isQueued) {
      return 'bg-yellow-400 border-yellow-400 shadow-yellow-300/50 animate-pulse';
    }
    return 'bg-gray-400 border-gray-400 hover:border-primary';
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (onContextMenu) {
      onContextMenu(event, data.id);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex items-center justify-center',
        'w-12 h-12 rounded-full border-2',
        'text-sm font-semibold text-background',
        'transition-all duration-300 ease-in-out',
        'cursor-pointer select-none',
        getNodeStyle(),
        selected && 'ring-2 ring-accent ring-offset-2 ring-offset-background'
      )}
      onContextMenu={handleContextMenu}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-accent border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-accent border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-accent border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-accent border-0"
      />
      
      <span className="z-10">{nodeData.label}</span>
    </motion.div>
  );
});

GraphNode.displayName = 'GraphNode';
