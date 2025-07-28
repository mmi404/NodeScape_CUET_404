import { useCallback, useRef } from 'react';
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

  return (
    <div className="w-full bg-card rounded-lg border border-border overflow-hidden relative pt-12 sm:pt-0" style={{ height: '70vh', minHeight: '400px' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="top-right"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'hsl(var(--card))', width: '100%', height: '100%' }}
        zoomOnScroll={true}
        panOnDrag={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        panOnScroll={false}
        ref={reactFlowWrapperRef}
      >
        <Controls 
          className="bg-card border border-border rounded-lg absolute top-0 left-1/2 transform -translate-x-1/2 z-10 sm:static sm:transform-none"
          showInteractive={false}
        />
        {styledNodes.map((node) => {
          const NodeComponent = nodeTypes[node.type || 'graphNode'] || GraphNode;
          return (
            <NodeComponent
              key={node.id}
              id={node.id}
              data={node.data}
              selected={node.selected}
              onContextMenu={onContextMenu}
            />
          );
        })}
        <Background 
          color="hsl(var(--border))" 
          gap={20} 
          size={1}
        />
        <MiniMap 
          className="bg-card border border-border rounded-lg"
          nodeColor="hsl(var(--node-default))"
          nodeStrokeWidth={2}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};
