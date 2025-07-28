import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Node, Edge } from '@xyflow/react';
import { MatrixInput } from './input-modes/MatrixInput';
import { EdgeListInput } from './input-modes/EdgeListInput';
import { AdjacencyListInput } from './input-modes/AdjacencyListInput';
import { JsonInput } from './input-modes/JsonInput';
import { FileUploadInput } from './input-modes/FileUploadInput';

interface GraphInputPanelProps {
  onGraphGenerated: (nodes: Node[], edges: Edge[]) => void;
  disabled?: boolean;
}

export const GraphInputPanel = ({ onGraphGenerated, disabled = false }: GraphInputPanelProps) => {
  const [activeTab, setActiveTab] = useState('drag-drop');

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Graph Input Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-6 min-w-max w-full">
              <TabsTrigger value="drag-drop" className="text-xs px-2 py-1 whitespace-nowrap">Drag & Drop</TabsTrigger>
              <TabsTrigger value="matrix" className="text-xs px-2 py-1 whitespace-nowrap">Matrix</TabsTrigger>
              <TabsTrigger value="edge-list" className="text-xs px-2 py-1 whitespace-nowrap">Edge List</TabsTrigger>
              <TabsTrigger value="adj-list" className="text-xs px-2 py-1 whitespace-nowrap">Adj List</TabsTrigger>
              <TabsTrigger value="json" className="text-xs px-2 py-1 whitespace-nowrap">JSON</TabsTrigger>
              <TabsTrigger value="upload" className="text-xs px-2 py-1 whitespace-nowrap">Upload</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="drag-drop" className="mt-4">
            <div className="text-center text-muted-foreground py-4">
              <p>Use the canvas to create nodes and edges by clicking and dragging.</p>
              <p className="text-sm mt-2">• Click "Add Node" to create nodes</p>
              <p className="text-sm">• Drag from one node to another to create edges</p>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="mt-4">
            <MatrixInput onGraphGenerated={onGraphGenerated} disabled={disabled} />
          </TabsContent>

          <TabsContent value="edge-list" className="mt-4">
            <EdgeListInput onGraphGenerated={onGraphGenerated} disabled={disabled} />
          </TabsContent>

          <TabsContent value="adj-list" className="mt-4">
            <AdjacencyListInput onGraphGenerated={onGraphGenerated} disabled={disabled} />
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            <JsonInput onGraphGenerated={onGraphGenerated} disabled={disabled} />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <FileUploadInput onGraphGenerated={onGraphGenerated} disabled={disabled} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};