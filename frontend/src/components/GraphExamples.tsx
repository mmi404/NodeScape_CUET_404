import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Node, Edge } from '@xyflow/react';

interface GraphExamplesProps {
  onLoadExample: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
  isDirected?: boolean;
}

export const GraphExamples = ({ onLoadExample, disabled = false, isDirected = true }: GraphExamplesProps) => {
  const examples = {
    simple: {
      name: "Simple Path",
      nodes: [
        { id: "A", position: { x: 100, y: 100 } },
        { id: "B", position: { x: 300, y: 100 } },
        { id: "C", position: { x: 500, y: 100 } },
        { id: "D", position: { x: 700, y: 100 } }
      ],
      edges: [
        { source: "A", target: "B" },
        { source: "B", target: "C" },
        { source: "C", target: "D" }
      ]
    },
    cycle: {
      name: "Cycle Graph",
      nodes: [
        { id: "A", position: { x: 300, y: 100 } },
        { id: "B", position: { x: 500, y: 200 } },
        { id: "C", position: { x: 400, y: 400 } },
        { id: "D", position: { x: 200, y: 400 } },
        { id: "E", position: { x: 100, y: 200 } }
      ],
      edges: [
        { source: "A", target: "B" },
        { source: "B", target: "C" },
        { source: "C", target: "D" },
        { source: "D", target: "E" },
        { source: "E", target: "A" }
      ]
    },
    tree: {
      name: "Binary Tree",
      nodes: [
        { id: "A", position: { x: 400, y: 50 } },
        { id: "B", position: { x: 250, y: 150 } },
        { id: "C", position: { x: 550, y: 150 } },
        { id: "D", position: { x: 150, y: 250 } },
        { id: "E", position: { x: 350, y: 250 } },
        { id: "F", position: { x: 450, y: 250 } },
        { id: "G", position: { x: 650, y: 250 } }
      ],
      edges: [
        { source: "A", target: "B" },
        { source: "A", target: "C" },
        { source: "B", target: "D" },
        { source: "B", target: "E" },
        { source: "C", target: "F" },
        { source: "C", target: "G" }
      ]
    }
  };

  const loadExample = (exampleKey: keyof typeof examples) => {
    const example = examples[exampleKey];
    const nodes: Node[] = example.nodes.map(node => ({
      id: node.id,
      type: 'graphNode',
      position: node.position,
      data: { label: node.id }
    }));

    const edges: Edge[] = example.edges.map(edge => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'graphEdge',
      data: { isDirected }
    }));

    onLoadExample(nodes, edges);
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base sm:text-lg">Quick Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(examples).map(([key, example]) => (
          <Button
            key={key}
            onClick={() => loadExample(key as keyof typeof examples)}
            variant="outline"
            className="w-full justify-start text-sm"
            disabled={disabled}
          >
            {example.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};