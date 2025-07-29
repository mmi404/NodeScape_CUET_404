import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <div 
      className="fixed z-50" 
      style={{ top: position.y, left: position.x }}
    >
      <Card className="w-48 shadow-lg">
        <CardContent className="p-2 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleDelete}>
            Delete Node
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleRename}>
            Rename Node
          </Button>
          {/* <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleAddEdge}>
            Add Edge
          </Button> */}
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSetStartNode}>
            Set as Start Node
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
