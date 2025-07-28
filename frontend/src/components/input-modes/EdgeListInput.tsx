import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

interface EdgeListInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
}

export const EdgeListInput = ({ onGraphGenerated, disabled = false }: EdgeListInputProps) => {
  const [edgeList, setEdgeList] = useState('A B\nB C\nC D\nD A');

  const generateGraph = () => {
    try {
      const lines = edgeList.trim().split('\n').filter(line => line.trim());
      const nodeSet = new Set<string>();
      const edges: Edge[] = [];

      // Parse edges and collect unique nodes
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length !== 2) {
          toast.error(`Invalid edge format: "${line}". Use format "A B"`);
          return;
        }

        const [source, target] = parts;
        if (source === target) {
          toast.error(`Self-loop detected: "${line}". Self-loops are not allowed.`);
          return;
        }

        nodeSet.add(source);
        nodeSet.add(target);
        
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          type: 'graphEdge'
        });
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
        toast.error('No valid edges found');
        return;
      }

      onGraphGenerated(nodes, edges);
      toast.success(`Graph generated with ${nodes.length} nodes and ${edges.length} edges!`);
    } catch (error) {
      toast.error('Error parsing edge list');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edge-list">Edge List:</Label>
        <Textarea
          id="edge-list"
          value={edgeList}
          onChange={(e) => setEdgeList(e.target.value)}
          placeholder="A B&#10;B C&#10;C D"
          className="mt-2 font-mono text-sm"
          rows={6}
          disabled={disabled}
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Enter one edge per line: "source target"</p>
        <p className="hidden sm:block">• Example: "A B" creates an edge from node A to node B</p>
        <p className="hidden sm:block">• Nodes will be created automatically</p>
      </div>

      <Button 
        onClick={generateGraph} 
        className="w-full"
        disabled={disabled}
      >
        Generate Graph from Edge List
      </Button>
    </div>
  );
};