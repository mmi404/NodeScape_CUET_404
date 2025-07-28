import React from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
} from '@/components/ui/context-menu';

interface NodeContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  nodeId: string | null;
  onDelete: (nodeId: string) => void;
  onRename: (nodeId: string) => void;
  onAddEdge: (nodeId: string) => void;
  onSetStartNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  visible,
  position,
  nodeId,
  onDelete,
  onRename,
  onAddEdge,
  onSetStartNode,
  onClose,
}) => {
  if (!visible || !nodeId) {
    return null;
  }

  const style = {
    position: 'fixed' as const,
    top: position.y,
    left: position.x,
    zIndex: 1000,
  };

  const handleDelete = () => {
    onDelete(nodeId);
    onClose();
  };

  const handleRename = () => {
    onRename(nodeId);
    onClose();
  };

  const handleAddEdge = () => {
    onAddEdge(nodeId);
    onClose();
  };

  const handleSetStartNode = () => {
    onSetStartNode(nodeId);
    onClose();
  };

  return (
    <ContextMenuPortal>
      <ContextMenuContent style={style} onContextMenu={(e) => e.preventDefault()}>
        <ContextMenuItem onSelect={handleDelete}>Delete Node</ContextMenuItem>
        <ContextMenuItem onSelect={handleRename}>Rename Node</ContextMenuItem>
        <ContextMenuItem onSelect={handleAddEdge}>Add Edge</ContextMenuItem>
        <ContextMenuItem onSelect={handleSetStartNode}>Set as Start Node</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPortal>
  );
};
