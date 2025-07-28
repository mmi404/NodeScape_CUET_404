import { useState, useCallback, useRef, useEffect } from 'react';
import { Edge, Node } from '@xyflow/react';

interface TraversalStep {
  currentNode: string;
  visitedNodes: string[];
  queuedNodes: string[];
  step: number;
}

export const useGraphTraversal = (nodes: Node[], edges: Edge[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [queuedNodes, setQueuedNodes] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<TraversalStep[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const stepIndexRef = useRef(0);

  // Build adjacency list from edges
  const buildAdjacencyList = useCallback(() => {
    const adjacencyList: Record<string, string[]> = {};
    
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
    });

    edges.forEach(edge => {
      adjacencyList[edge.source].push(edge.target);
      adjacencyList[edge.target].push(edge.source); // Undirected graph
    });

    return adjacencyList;
  }, [nodes, edges]);

  // Generate BFS traversal steps
  const generateBFSSteps = useCallback((startNodeId: string): TraversalStep[] => {
    const adjacencyList = buildAdjacencyList();
    const visited = new Set<string>();
    const queue = [startNodeId];
    const steps: TraversalStep[] = [];
    let stepCount = 0;

    visited.add(startNodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      steps.push({
        currentNode: current,
        visitedNodes: Array.from(visited),
        queuedNodes: [...queue],
        step: stepCount++,
      });

      // Add unvisited neighbors to queue
      adjacencyList[current]?.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }

    return steps;
  }, [buildAdjacencyList]);

  // Generate DFS traversal steps
  const generateDFSSteps = useCallback((startNodeId: string): TraversalStep[] => {
    const adjacencyList = buildAdjacencyList();
    const visited = new Set<string>();
    const stack = [startNodeId];
    const steps: TraversalStep[] = [];
    let stepCount = 0;

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (!visited.has(current)) {
        visited.add(current);
        
        steps.push({
          currentNode: current,
          visitedNodes: Array.from(visited),
          queuedNodes: [...stack],
          step: stepCount++,
        });

        // Add unvisited neighbors to stack (in reverse order for consistent traversal)
        const neighbors = adjacencyList[current] || [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i];
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return steps;
  }, [buildAdjacencyList]);

  // Start traversal
  const startTraversal = useCallback((algorithm: 'BFS' | 'DFS', startNodeId: string, speed: number) => {
    if (!nodes.find(node => node.id === startNodeId)) return;

    const traversalSteps = algorithm === 'BFS' 
      ? generateBFSSteps(startNodeId)
      : generateDFSSteps(startNodeId);

    setSteps(traversalSteps);
    setCurrentStep(0);
    setIsRunning(true);
    setIsPaused(false);
    stepIndexRef.current = 0;

    // Start animation
    intervalRef.current = setInterval(() => {
      const currentStepIndex = stepIndexRef.current;
      
      if (currentStepIndex < traversalSteps.length) {
        const step = traversalSteps[currentStepIndex];
        setCurrentNode(step.currentNode);
        setVisitedNodes(step.visitedNodes);
        setQueuedNodes(step.queuedNodes);
        setCurrentStep(step.step + 1);
        stepIndexRef.current++;
      } else {
        // Traversal complete
        setIsRunning(false);
        setCurrentNode(undefined);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, speed);
  }, [nodes, generateBFSSteps, generateDFSSteps]);

  // Pause traversal
  const pauseTraversal = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Resume traversal
  const resumeTraversal = useCallback((speed: number) => {
    if (isPaused && steps.length > 0) {
      setIsRunning(true);
      setIsPaused(false);

      intervalRef.current = setInterval(() => {
        const currentStepIndex = stepIndexRef.current;
        
        if (currentStepIndex < steps.length) {
          const step = steps[currentStepIndex];
          setCurrentNode(step.currentNode);
          setVisitedNodes(step.visitedNodes);
          setQueuedNodes(step.queuedNodes);
          setCurrentStep(step.step + 1);
          stepIndexRef.current++;
        } else {
          setIsRunning(false);
          setCurrentNode(undefined);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, speed);
    }
  }, [isPaused, steps]);

  // Stop traversal
  const stopTraversal = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setVisitedNodes([]);
    setQueuedNodes([]);
    setCurrentNode(undefined);
    setSteps([]);
    stepIndexRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Reset all state
  const resetTraversal = useCallback(() => {
    stopTraversal();
  }, [stopTraversal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    totalSteps: steps.length,
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
  };
};