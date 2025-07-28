import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { Upload, FileText } from 'lucide-react';

interface FileUploadInputProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
}

export const FileUploadInput = ({ onGraphGenerated, disabled = false }: FileUploadInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['.json', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        toast.error('Please select a .json or .txt file');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const parseJsonFile = (content: string): { nodes: Node[], edges: Edge[] } => {
    const data = JSON.parse(content);
    
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid JSON: "nodes" array is required');
    }
    
    if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid JSON: "edges" array is required');
    }

    const nodes: Node[] = data.nodes.map((nodeData: any, index: number) => {
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

    const edges: Edge[] = data.edges.map((edgeData: any, index: number) => {
      const source = edgeData.from || edgeData.source;
      const target = edgeData.to || edgeData.target;
      
      if (!source || !target) {
        throw new Error(`Edge at index ${index} missing source/target`);
      }
      
      return {
        id: `${source}-${target}`,
        source,
        target,
        type: 'graphEdge'
      };
    });

    return { nodes, edges };
  };

  const parseTextFile = (content: string): { nodes: Node[], edges: Edge[] } => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    // Try to detect format
    const firstLine = lines[0];
    
    if (firstLine.includes(':')) {
      // Adjacency list format
      return parseAdjacencyList(lines);
    } else {
      // Edge list format
      return parseEdgeList(lines);
    }
  };

  const parseEdgeList = (lines: string[]): { nodes: Node[], edges: Edge[] } => {
    const nodeSet = new Set<string>();
    const edges: Edge[] = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length !== 2) continue;
      
      const [source, target] = parts;
      nodeSet.add(source);
      nodeSet.add(target);
      
      edges.push({
        id: `${source}-${target}`,
        source,
        target,
        type: 'graphEdge'
      });
    }

    const nodes: Node[] = Array.from(nodeSet).map((nodeId, index) => ({
      id: nodeId,
      type: 'graphNode',
      position: {
        x: 150 + (index % 4) * 200,
        y: 150 + Math.floor(index / 4) * 150
      },
      data: { label: nodeId }
    }));

    return { nodes, edges };
  };

  const parseAdjacencyList = (lines: string[]): { nodes: Node[], edges: Edge[] } => {
    const nodeSet = new Set<string>();
    const edges: Edge[] = [];

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const source = line.substring(0, colonIndex).trim();
      const targets = line.substring(colonIndex + 1).trim();
      
      nodeSet.add(source);
      
      if (targets) {
        const targetList = targets.split(/\s+/).filter(t => t.trim());
        for (const target of targetList) {
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

    const nodes: Node[] = Array.from(nodeSet).map((nodeId, index) => ({
      id: nodeId,
      type: 'graphNode',
      position: {
        x: 150 + (index % 4) * 200,
        y: 150 + Math.floor(index / 4) * 150
      },
      data: { label: nodeId }
    }));

    return { nodes, edges };
  };

  const processFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      const content = await selectedFile.text();
      let nodes: Node[], edges: Edge[];

      if (selectedFile.name.endsWith('.json')) {
        ({ nodes, edges } = parseJsonFile(content));
      } else {
        ({ nodes, edges } = parseTextFile(content));
      }

      if (nodes.length === 0) {
        toast.error('No valid nodes found in file');
        return;
      }

      onGraphGenerated(nodes, edges);
      toast.success(`Graph loaded from ${selectedFile.name} with ${nodes.length} nodes and ${edges.length} edges!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`File Error: ${error instanceof Error ? error.message : 'Failed to process file'}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Upload Graph File:</Label>
        <Input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept=".json,.txt"
          onChange={handleFileSelect}
          className="mt-2"
          disabled={disabled}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• JSON files: Use same format as JSON input</p>
        <p className="hidden sm:block">• TXT files: Edge list (A B) or adjacency list (A: B C)</p>
        <p className="hidden sm:block">• Maximum file size: 1MB</p>
      </div>

      <Button 
        onClick={processFile} 
        className="w-full"
        disabled={disabled || !selectedFile}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload and Generate Graph
      </Button>
    </div>
  );
};