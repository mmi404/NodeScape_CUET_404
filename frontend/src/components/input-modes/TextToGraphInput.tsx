import React, { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface TextToGraphInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
  isDirected?: boolean;
}

export const TextToGraphInput = ({ onGraphGenerated, disabled = false, isDirected = true }: TextToGraphInputProps) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({ title: 'Input required', description: 'Please enter some text to parse.' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/parse-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const data = await response.json();
      // Add isDirected data to edges
      const edgesWithDirection = data.edges.map((edge: Edge) => ({
        ...edge,
        data: { ...edge.data, isDirected }
      }));
      onGraphGenerated(data.nodes, edgesWithDirection);
      toast({ title: 'Graph generated', description: 'Graph successfully generated from text.' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to generate graph.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Textarea
        placeholder="Enter text to parse into a graph..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || loading}
        rows={6}
      />
      <Button onClick={handleSubmit} disabled={disabled || loading}>
        {loading ? 'Generating...' : 'Generate Graph'}
      </Button>
    </div>
  );
};
