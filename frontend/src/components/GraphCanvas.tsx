import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';

const nodeTypes = {
  graphNode: GraphNode,
};

const edgeTypes = {
  graphEdge: GraphEdge,
};

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (nodeId: string) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>, nodeId: string) => void;
  currentNode?: string;
  visitedNodes: string[];
  queuedNodes: string[];
}

export const GraphCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onContextMenu,
  currentNode,
  visitedNodes,
  queuedNodes,
}: GraphCanvasProps) => {
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);

  // Update node styles based on traversal state
  const styledNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isVisited: visitedNodes.includes(node.id),
      isCurrent: currentNode === node.id,
      isQueued: queuedNodes.includes(node.id),
    },
  }));

  // Update edge styles based on traversal state
  const styledEdges = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      isActive: currentNode === edge.source || currentNode === edge.target,
      isVisited: visitedNodes.includes(edge.source) && visitedNodes.includes(edge.target),
    },
    animated: currentNode === edge.source || currentNode === edge.target,
  }));

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    onNodeClick(node.id);
  }, [onNodeClick]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    if (onContextMenu) {
      onContextMenu(event, node.id);
    }
  }, [onContextMenu]);

  // Auto-fit view when nodes change
  const reactFlowInstance = useRef<any>(null);
  
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  // Fit view when nodes change
  useEffect(() => {
    if (reactFlowInstance.current && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2, duration: 300 });
      }, 100);
    }
  }, [nodes.length]);

  return (
    <div className="w-full bg-card rounded-lg border border-border overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'hsl(var(--card))', width: '100%', height: '100%' }}
        zoomOnScroll={true}
        panOnDrag={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        panOnScroll={false}
        connectionMode="loose"

      >
        <Background 
          color="hsl(var(--border))" 
          gap={20} 
          size={1}
        />
      </ReactFlow>
    </div>
  );
};
