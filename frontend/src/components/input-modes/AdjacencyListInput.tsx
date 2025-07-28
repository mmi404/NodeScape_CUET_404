import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

interface AdjacencyListInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
}

export const AdjacencyListInput = ({ onGraphGenerated, disabled = false }: AdjacencyListInputProps) => {
  const [adjList, setAdjList] = useState('A: B C\nB: D\nC: D\nD:');

  const generateGraph = () => {
    try {
      const lines = adjList.trim().split('\n').filter(line => line.trim());
      const nodeSet = new Set<string>();
      const edges: Edge[] = [];

      // Parse adjacency list
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
          toast.error(`Invalid format: "${line}". Use format "A: B C"`);
          return;
        }

        const source = line.substring(0, colonIndex).trim();
        const targets = line.substring(colonIndex + 1).trim();
        
        if (!source) {
          toast.error(`Empty node name in line: "${line}"`);
          return;
        }

        nodeSet.add(source);

        if (targets) {
          const targetList = targets.split(/\s+/).filter(t => t.trim());
          for (const target of targetList) {
            if (source === target) {
              toast.error(`Self-loop detected: "${source}" -> "${target}". Self-loops are not allowed.`);
              return;
            }

            nodeSet.add(target);
            edges.push({
              id: `${source}-${target}`,
              source,
              target,
              type: 'graphEdge'
            });
          }
        }
      }

      // Create nodes
      const nodes: Node[] = Array.from(nodeSet).map((nodeId, index) => ({
        id: nodeId,
        type: 'graphNode',
        position: {
          x: 150 + (index % 4) * 200,
          y: 150 + Math.floor(index / 4) * 150
        },
        data: { label: nodeId }
      }));

      if (nodes.length === 0) {
        toast.error('No valid nodes found');
        return;
      }

      onGraphGenerated(nodes, edges);
      toast.success(`Graph generated with ${nodes.length} nodes and ${edges.length} edges!`);
    } catch (error) {
      toast.error('Error parsing adjacency list');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="adj-list">Adjacency List:</Label>
        <Textarea
          id="adj-list"
          value={adjList}
          onChange={(e) => setAdjList(e.target.value)}
          placeholder="A: B C&#10;B: D&#10;C: D&#10;D:"
          className="mt-2 font-mono text-sm"
          rows={6}
          disabled={disabled}
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Format: "node: neighbor1 neighbor2"</p>
        <p className="hidden sm:block">• Example: "A: B C" means A connects to B and C</p>
        <p className="hidden sm:block">• Use "A:" for nodes with no outgoing edges</p>
      </div>

      <Button 
        onClick={generateGraph} 
        className="w-full"
        disabled={disabled}
      >
        Generate Graph from Adjacency List
      </Button>
    </div>
  );
};