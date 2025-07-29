import { Node, Edge } from '@xyflow/react';

export interface GraphExport {
  directed: boolean;
  nodes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
}

export const exportGraphToJson = (nodes: Node[], edges: Edge[], isDirected: boolean = false): string => {
  const exportData: GraphExport = {
    directed: isDirected,
    nodes: nodes.map(node => ({
      id: node.id,
      label: node.data.label || node.id,
      x: node.position.x,
      y: node.position.y
    })),
    edges: edges.map(edge => ({
      from: edge.source,
      to: edge.target
    }))
  };

  return JSON.stringify(exportData, null, 2);
};

export const exportGraphToEdgeList = (edges: Edge[]): string => {
  return edges.map(edge => `${edge.source} ${edge.target}`).join('\n');
};

export const exportGraphToAdjacencyList = (nodes: Node[], edges: Edge[], isDirected: boolean = false): string => {
  const adjacencyMap = new Map<string, string[]>();
  
  // Initialize all nodes
  nodes.forEach(node => {
    adjacencyMap.set(node.id, []);
  });
  
  // Add edges
  edges.forEach(edge => {
    const neighbors = adjacencyMap.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyMap.set(edge.source, neighbors);
    
    // For undirected graphs, add reverse edge
    if (!isDirected && !(edge.data?.isDirected ?? false)) {
      const reverseNeighbors = adjacencyMap.get(edge.target) || [];
      reverseNeighbors.push(edge.source);
      adjacencyMap.set(edge.target, reverseNeighbors);
    }
  });
  
  // Format as adjacency list
  return Array.from(adjacencyMap.entries())
    .map(([node, neighbors]) => `${node}: ${neighbors.join(' ')}`)
    .join('\n');
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};