import { useState, useCallback, useEffect } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  NodeChange,
  EdgeChange,
  Node,
  Edge,
} from '@xyflow/react';

import { GraphCanvas } from '@/components/GraphCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusPanel } from '@/components/StatusPanel';
import { NodeContextMenu } from '@/components/NodeContextMenu';
import { GraphInputPanel } from '@/components/GraphInputPanel';
import { GraphExamples } from '@/components/GraphExamples';
import { useGraphTraversal } from '@/hooks/useGraphTraversal';
import { toast } from 'sonner';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [algorithm, setAlgorithm] = useState<'BFS' | 'DFS'>('BFS');
  const [startNode, setStartNode] = useState('A');
  const [speed, setSpeed] = useState(1000);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const {
    currentStep,
    totalSteps,
    visitedNodes,
    queuedNodes,
    currentNode,
    isRunning,
    isPaused,
    startTraversal,
    pauseTraversal,
    resumeTraversal,
    stopTraversal,
    resetTraversal,
  } = useGraphTraversal(nodes, edges);

  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [edgeSourceNodeId, setEdgeSourceNodeId] = useState<string | null>(null);

  const onConnect = useCallback((params: Connection) => {
    // Save current state to undo stack before change
    setUndoStack((stack) => [...stack, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]); // Clear redo stack on new action

    setEdges((eds) => {
      // Prevent self-loop edges
      if (params.source === params.target) {
        toast.error('Cannot connect node to itself.');
        return eds;
      }
      // Prevent duplicate edges
      const exists = eds.some(
        (e) =>
          (e.source === params.source && e.target === params.target) ||
          (e.source === params.target && e.target === params.source)
      );
      if (exists) {
        toast.error('Edge already exists between these nodes.');
        return eds;
      }
      toast.success('Edge added successfully!');
      return addEdge({ ...params, type: 'graphEdge' }, eds);
    });
  }, [setEdges, nodes, edges]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) {
      toast.error('Nothing to undo');
      return;
    }
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, stack.length - 1));
    setRedoStack((stack) => [...stack, { nodes: [...nodes], edges: [...edges] }]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    toast.success('Undo performed');
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) {
      toast.error('Nothing to redo');
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, stack.length - 1));
    setUndoStack((stack) => [...stack, { nodes: [...nodes], edges: [...edges] }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    toast.success('Redo performed');
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (isAddingEdge) {
      if (edgeSourceNodeId && edgeSourceNodeId !== nodeId) {
        // Save current state to undo stack before change
        setUndoStack((stack) => [...stack, { nodes, edges }]);
        setRedoStack([]); // Clear redo stack on new action

        // Add edge from source to this node
        setEdges((eds) => addEdge({ id: edgeSourceNodeId + '-' + nodeId, source: edgeSourceNodeId, target: nodeId, type: 'graphEdge' }, eds));
        toast.success('Edge added from ' + edgeSourceNodeId + ' to ' + nodeId);
        setIsAddingEdge(false);
        setEdgeSourceNodeId(null);
      } else {
        toast.error('Cannot add edge to the same node.');
      }
      setContextMenuVisible(false);
      return;
    }

    if (!isRunning && !isPaused) {
      setStartNode(nodeId);
      toast.info('Start node set to ' + nodeId);
    }
  }, [isAddingEdge, edgeSourceNodeId, isRunning, isPaused, setEdges, nodes, edges]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    event.preventDefault();
    setContextMenuNodeId(nodeId);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    // Save current state to undo stack before change
    setUndoStack((stack) => [...stack, { nodes, edges }]);
    setRedoStack([]); // Clear redo stack on new action

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    toast.success('Node ' + nodeId + ' deleted');
  }, [setNodes, setEdges, nodes, edges]);

  const handleRenameNode = useCallback((nodeId: string) => {
    const newName = prompt('Enter new name for node', nodeId);
    if (newName && newName.trim() !== '') {
      // Save current state to undo stack before change
      setUndoStack((stack) => [...stack, { nodes, edges }]);
      setRedoStack([]); // Clear redo stack on new action

      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, id: newName.trim(), data: { ...node.data, label: newName.trim() } } : node
        )
      );
      // Also update edges source/target if needed
      setEdges((eds) =>
        eds.map((edge) => {
          let updatedEdge = { ...edge };
          if (edge.source === nodeId) updatedEdge.source = newName.trim();
          if (edge.target === nodeId) updatedEdge.target = newName.trim();
          return updatedEdge;
        })
      );
      toast.success('Node renamed to ' + newName.trim());
    }
  }, [setNodes, setEdges, nodes, edges]);

  const handleAddEdge = useCallback((nodeId: string) => {
    setIsAddingEdge(true);
    setEdgeSourceNodeId(nodeId);
    setContextMenuVisible(false);
    toast.info('Select a node to connect an edge from ' + nodeId);
  }, []);

  const handleSetStartNode = useCallback((nodeId: string) => {
    setStartNode(nodeId);
    setContextMenuVisible(false);
    toast.info('Start node set to ' + nodeId);
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuVisible(false);
    setIsAddingEdge(false);
    setEdgeSourceNodeId(null);
  }, []);

  const handleStart = useCallback(() => {
    if (isPaused) {
      resumeTraversal(speed);
      toast.info('Traversal resumed');
    } else {
      startTraversal(algorithm, startNode, speed);
      toast.success(algorithm + ' traversal started from node ' + startNode);
    }
  }, [isPaused, speed, algorithm, startNode, startTraversal, resumeTraversal]);

  const handlePause = useCallback(() => {
    pauseTraversal();
    toast.info('Traversal paused');
  }, [pauseTraversal]);

  const handleStop = useCallback(() => {
    stopTraversal();
    toast.info('Traversal stopped');
  }, [stopTraversal]);

  const handleReset = useCallback(() => {
    // Save current state to undo stack before change
    setUndoStack((stack) => [...stack, { nodes, edges }]);
    setRedoStack([]); // Clear redo stack on new action

    resetTraversal();
    setNodes(initialNodes);
    setEdges(initialEdges);
    setStartNode('A');
    toast.success('Graph reset to initial state');
  }, [resetTraversal, setNodes, setEdges, nodes, edges]);

  const generateNodeId = (index: number): string => {
    if (index < 26) return String.fromCharCode(65 + index);
    if (index < 702) {
      const first = Math.floor((index - 26) / 26);
      const second = (index - 26) % 26;
      return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
    }
    const first = Math.floor((index - 702) / 676);
    const remaining = (index - 702) % 676;
    const second = Math.floor(remaining / 26);
    const third = remaining % 26;
    return String.fromCharCode(65 + first) + String.fromCharCode(65 + second) + String.fromCharCode(65 + third);
  };

  const handleAddNode = useCallback(() => {
    const nodeId = generateNodeId(nodes.length);
    
    // Dynamic spacing based on number of nodes
    const totalNodes = nodes.length + 1;
    const maxCols = Math.min(6, Math.ceil(Math.sqrt(totalNodes * 1.5)));
    const spacing = Math.max(120, 600 / maxCols);
    
    const index = nodes.length;
    const row = Math.floor(index / maxCols);
    const col = index % maxCols;
    
    const newNode = {
      id: nodeId,
      type: 'graphNode',
      position: { 
        x: 100 + col * spacing, 
        y: 100 + row * (spacing * 0.8) 
      },
      data: { label: nodeId },
    };
    
    setNodes((nds) => nds.concat(newNode));
    toast.success('Node ' + nodeId + ' added!');
  }, [nodes.length, setNodes]);

  const handleGraphGenerated = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    // Save current state to undo stack before change
    setUndoStack((stack) => [...stack, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]); // Clear redo stack on new action
    
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Set start node to first node if available
    if (newNodes.length > 0) {
      setStartNode(newNodes[0].id);
    }
  }, [nodes, edges, setNodes, setEdges]);

  const availableNodes = nodes.map(node => node.id);

  return (
    <div className="min-h-screen bg-background p-4" onClick={handleCloseContextMenu}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Graph Traversal Visualizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Visualize BFS and DFS algorithms step by step
          </p>
        </header>

        {/* Graph Input Methods - Top Section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <GraphInputPanel 
              onGraphGenerated={handleGraphGenerated}
              disabled={isRunning}
            />
          </div>
          <div className="lg:col-span-1">
            <GraphExamples 
              onLoadExample={handleGraphGenerated}
              disabled={isRunning}
            />
          </div>
        </div>

        {/* Main Graph Interface */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4">
          {/* Graph Controls for small devices */}
          <div className="order-1 lg:hidden">
            <ControlPanel
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              startNode={startNode}
              onStartNodeChange={setStartNode}
              speed={speed}
              onSpeedChange={setSpeed}
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onReset={handleReset}
              onAddNode={handleAddNode}
              onUndo={handleUndo}
              onRedo={handleRedo}
              availableNodes={availableNodes}
              disabled={isRunning}
              renderGraphControlsOnly={true}
              nodes={nodes}
              edges={edges}
            />
          </div>

          {/* Graph Canvas */}
          <div className="order-2 lg:order-none lg:col-span-2">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange as (changes: NodeChange[]) => void}
              onEdgesChange={onEdgesChange as (changes: EdgeChange[]) => void}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onContextMenu={handleContextMenu}
              currentNode={currentNode}
              visitedNodes={visitedNodes}
              queuedNodes={queuedNodes}
            />
          </div>

          {/* Control Panel */}
          <div className="order-3 lg:order-none lg:col-span-1">
            <ControlPanel
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              startNode={startNode}
              onStartNodeChange={setStartNode}
              speed={speed}
              onSpeedChange={setSpeed}
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onReset={handleReset}
              onAddNode={handleAddNode}
              onUndo={handleUndo}
              onRedo={handleRedo}
              availableNodes={availableNodes}
              disabled={isRunning}
              renderGraphControlsOnly={false}
              nodes={nodes}
              edges={edges}
            />
          </div>

          {/* Status Panel */}
          <div className="order-4 lg:order-none lg:col-span-1">
            <StatusPanel
              algorithm={algorithm}
              currentStep={currentStep}
              totalSteps={totalSteps}
              currentNode={currentNode}
              visitedNodes={visitedNodes}
              queuedNodes={queuedNodes}
              edges={edges}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>

      <NodeContextMenu
        visible={contextMenuVisible}
        position={contextMenuPosition}
        nodeId={contextMenuNodeId}
        onDelete={handleDeleteNode}
        onRename={handleRenameNode}
        onAddEdge={handleAddEdge}
        onSetStartNode={handleSetStartNode}
        onClose={handleCloseContextMenu}
      />
    </div>
  );
};

export default Index;
