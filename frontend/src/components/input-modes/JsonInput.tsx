import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

interface JsonInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
}

interface GraphJson {
  directed?: boolean;
  nodes: Array<{ id: string; label?: string; x?: number; y?: number }>;
  edges: Array<{ from: string; to: string; source?: string; target?: string }>;
}

export const JsonInput = ({ onGraphGenerated, disabled = false }: JsonInputProps) => {
  const [jsonInput, setJsonInput] = useState(`{
  "directed": false,
  "nodes": [
    {"id": "A"},
    {"id": "B"},
    {"id": "C"},
    {"id": "D"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"},
    {"from": "C", "to": "D"},
    {"from": "D", "to": "A"}
  ]
}`);

  const generateGraph = () => {
    try {
      const data: GraphJson = JSON.parse(jsonInput);

      if (!data.nodes || !Array.isArray(data.nodes)) {
        toast.error('Invalid JSON: "nodes" array is required');
        return;
      }

      if (!data.edges || !Array.isArray(data.edges)) {
        toast.error('Invalid JSON: "edges" array is required');
        return;
      }

      // Create nodes
      const nodes: Node[] = data.nodes.map((nodeData, index) => {
        if (!nodeData.id) {
          throw new Error(`Node at index ${index} missing required "id" field`);
        }

        return {
          id: nodeData.id,
          type: 'graphNode',
          position: {
            x: nodeData.x || 150 + (index % 4) * 200,
            y: nodeData.y || 150 + Math.floor(index / 4) * 150
          },
          data: { label: nodeData.label || nodeData.id }
        };
      });

      // Create edges
      const edges: Edge[] = data.edges.map((edgeData, index) => {
        const source = edgeData.from || edgeData.source;
        const target = edgeData.to || edgeData.target;

        if (!source || !target) {
          throw new Error(`Edge at index ${index} missing source/target. Use "from"/"to" or "source"/"target"`);
        }

        if (source === target) {
          throw new Error(`Self-loop detected in edge ${index}: "${source}" -> "${target}"`);
        }

        // Check if nodes exist
        const sourceExists = nodes.some(n => n.id === source);
        const targetExists = nodes.some(n => n.id === target);

        if (!sourceExists) {
          throw new Error(`Source node "${source}" not found in nodes array`);
        }
        if (!targetExists) {
          throw new Error(`Target node "${target}" not found in nodes array`);
        }

        return {
          id: `${source}-${target}`,
          source,
          target,
          type: 'graphEdge'
        };
      });

      if (nodes.length === 0) {
        toast.error('No nodes found in JSON');
        return;
      }

      onGraphGenerated(nodes, edges);
      toast.success(`Graph generated from JSON with ${nodes.length} nodes and ${edges.length} edges!`);
    } catch (error) {
      toast.error(`JSON Error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="json-input">JSON Graph Data:</Label>
        <Textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="mt-2 font-mono text-xs sm:text-sm"
          rows={8}
          disabled={disabled}
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Required: "nodes" with "id", "edges" with "from"/"to"</p>
        <p className="hidden sm:block">• Optional: "directed", node "label"/"x"/"y"</p>
        <p className="hidden sm:block">• All referenced nodes must exist in nodes array</p>
      </div>

      <Button 
        onClick={generateGraph} 
        className="w-full"
        disabled={disabled}
      >
        Generate Graph from JSON
      </Button>
    </div>
  );
};