import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

interface MatrixInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
  isDirected?: boolean;
}

export const MatrixInput = ({ onGraphGenerated, disabled = false, isDirected = true }: MatrixInputProps) => {
  const [size, setSize] = useState(3);
  const [matrix, setMatrix] = useState<number[][]>(
    Array(3).fill(null).map(() => Array(3).fill(0))
  );

  const updateSize = (newSize: number) => {
    if (newSize < 2 || newSize > 10) return;
    setSize(newSize);
    const newMatrix = Array(newSize).fill(null).map((_, i) => 
      Array(newSize).fill(null).map((_, j) => 
        i < matrix.length && j < matrix[0].length ? matrix[i][j] : 0
      )
    );
    setMatrix(newMatrix);
  };

  const updateCell = (row: number, col: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMatrix = matrix.map((r, i) => 
      r.map((c, j) => i === row && j === col ? numValue : c)
    );
    setMatrix(newMatrix);
  };

  const generateGraph = () => {
    try {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Create nodes
      for (let i = 0; i < size; i++) {
        const nodeId = String.fromCharCode(65 + i);
        nodes.push({
          id: nodeId,
          type: 'graphNode',
          position: {
            x: 150 + (i % 3) * 200,
            y: 150 + Math.floor(i / 3) * 150
          },
          data: { label: nodeId }
        });
      }

      // Create edges from matrix
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (matrix[i][j] > 0 && i !== j) {
            const sourceId = String.fromCharCode(65 + i);
            const targetId = String.fromCharCode(65 + j);
            edges.push({
              id: `${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
              type: 'graphEdge',
              data: { isDirected }
            });
          }
        }
      }

      onGraphGenerated(nodes, edges);
      toast.success(`Graph generated from ${size}x${size} matrix!`);
    } catch (error) {
      toast.error('Error generating graph from matrix');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Label htmlFor="matrix-size" className="text-sm">Matrix Size:</Label>
        <Input
          id="matrix-size"
          type="number"
          min="2"
          max="10"
          value={size}
          onChange={(e) => updateSize(parseInt(e.target.value))}
          className="w-20"
          disabled={disabled}
        />
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-1 min-w-fit" style={{ gridTemplateColumns: `repeat(${size}, minmax(40px, 1fr))` }}>
          {matrix.map((row, i) =>
            row.map((cell, j) => (
              <Input
                key={`${i}-${j}`}
                type="number"
                min="0"
                max="1"
                value={cell}
                onChange={(e) => updateCell(i, j, e.target.value)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center p-1 text-xs sm:text-sm"
                disabled={disabled}
              />
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• Enter 1 for connected nodes, 0 for disconnected</p>
        <p>• Diagonal values (self-loops) are ignored</p>
      </div>

      <Button 
        onClick={generateGraph} 
        className="w-full"
        disabled={disabled}
      >
        Generate Graph from Matrix
      </Button>
    </div>
  );
};