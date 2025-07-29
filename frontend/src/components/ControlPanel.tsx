import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Play, Pause, Square, RotateCcw, Plus, RotateCw, RotateCcw as RotateCounterClockwise, Download } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { exportGraphToJson, exportGraphToEdgeList, exportGraphToAdjacencyList, downloadFile } from '@/lib/graphUtils';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface ControlPanelProps {
  algorithm: 'BFS' | 'DFS';
  onAlgorithmChange: (algorithm: 'BFS' | 'DFS') => void;
  startNode: string;
  onStartNodeChange: (node: string) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  availableNodes: string[];
  disabled: boolean;
  renderGraphControlsOnly?: boolean;
  nodes?: Node[];
  edges?: Edge[];
}

export const ControlPanel = ({
  algorithm,
  onAlgorithmChange,
  startNode,
  onStartNodeChange,
  speed,
  onSpeedChange,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  onAddNode,
  onUndo,
  onRedo,
  availableNodes,
  disabled,
  renderGraphControlsOnly = false,
  nodes = [],
  edges = [],
}: ControlPanelProps) => {
  const handleExport = (format: 'json' | 'edgeList' | 'adjList' | 'pdf') => {
    if (nodes.length === 0) {
      return;
    }

    if (format === 'pdf') {
      exportToPDF();
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = exportGraphToJson(nodes, edges);
        filename = 'graph.json';
        mimeType = 'application/json';
        break;
      case 'edgeList':
        content = exportGraphToEdgeList(edges);
        filename = 'graph_edges.txt';
        mimeType = 'text/plain';
        break;
      case 'adjList':
        content = exportGraphToAdjacencyList(nodes, edges);
        filename = 'graph_adjacency.txt';
        mimeType = 'text/plain';
        break;
    }

    downloadFile(content, filename, mimeType);
  };

  const generateTraversalPath = (algorithm: 'BFS' | 'DFS', startNode: string): string[] => {
    if (!nodes.find(n => n.id === startNode)) return [];
    
    const adjacencyList: Record<string, string[]> = {};
    nodes.forEach(node => adjacencyList[node.id] = []);
    edges.forEach(edge => {
      adjacencyList[edge.source].push(edge.target);
      adjacencyList[edge.target].push(edge.source);
    });

    if (algorithm === 'BFS') {
      const visited = new Set<string>();
      const queue = [startNode];
      const path: string[] = [];
      visited.add(startNode);

      while (queue.length > 0) {
        const current = queue.shift()!;
        path.push(current);
        adjacencyList[current]?.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      return path;
    } else {
      const visited = new Set<string>();
      const stack = [startNode];
      const path: string[] = [];

      while (stack.length > 0) {
        const current = stack.pop()!;
        if (!visited.has(current)) {
          visited.add(current);
          path.push(current);
          const neighbors = adjacencyList[current] || [];
          for (let i = neighbors.length - 1; i >= 0; i--) {
            if (!visited.has(neighbors[i])) {
              stack.push(neighbors[i]);
            }
          }
        }
      }
      return path;
    }
  };

  const exportToPDF = async () => {
    const canvasContainer = document.querySelector('.react-flow') as HTMLElement;
    if (!canvasContainer) {
      toast.error('Graph canvas not found');
      return;
    }

    try {
      toast.info('Generating PDF...');
      
      // Force higher contrast for edges in PDF
      const edges = canvasContainer.querySelectorAll('.react-flow__edge-path');
      edges.forEach(edge => {
        (edge as SVGElement).style.stroke = '#000000';
        (edge as SVGElement).style.strokeWidth = '3';
      });
      
      const rect = canvasContainer.getBoundingClientRect();
      const isLandscape = rect.width > rect.height;
      
      const dataUrl = await toPng(canvasContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        quality: 1.0,
        skipFonts: false
      });
      
      // Restore original edge styles
      edges.forEach(edge => {
        (edge as SVGElement).style.stroke = '';
        (edge as SVGElement).style.strokeWidth = '';
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Generate traversal paths
      const firstNode = nodes[0]?.id || startNode;
      const bfsPath = generateTraversalPath('BFS', firstNode);
      const dfsPath = generateTraversalPath('DFS', firstNode);
      
      // Single page layout
      pdf.addImage(dataUrl, 'PNG', 10, 10, 190, 120);
      
      pdf.setFontSize(16);
      pdf.text('Graph Analysis', 105, 140, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Starting Node: ${firstNode}`, 20, 155);
      
      pdf.setFontSize(11);
      pdf.text('BFS Traversal:', 20, 170);
      pdf.text(`${bfsPath.join(' -> ')}`, 20, 180);
      
      pdf.text('DFS Traversal:', 20, 195);
      pdf.text(`${dfsPath.join(' -> ')}`, 20, 205);
      
      pdf.setFontSize(10);
      pdf.text(`BFS Nodes: ${bfsPath.length} | DFS Nodes: ${dfsPath.length}`, 20, 220);
      
      pdf.save('graph-analysis.pdf');
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base sm:text-lg">Graph Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onAddNode}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onUndo}
              variant="outline"
              className="flex-1"
              disabled={disabled}
              title="Undo"
            >
              <RotateCounterClockwise className="w-4 h-4" />
            </Button>
            <Button
              onClick={onRedo}
              variant="outline"
              className="flex-1"
              disabled={disabled}
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1"
              disabled={disabled}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reset Graph</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled || nodes.length === 0}
                  className="sm:px-3 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 sm:mr-0 mr-2" />
                  <span className="sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('edgeList')}>
                  Export as Edge List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('adjList')}>
                  Export as Adjacency List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {!renderGraphControlsOnly && (
        <>
          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base sm:text-lg">Traversal Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={onAlgorithmChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BFS">Breadth-First Search</SelectItem>
                    <SelectItem value="DFS">Depth-First Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startNode">Start Node</Label>
                <Select value={startNode} onValueChange={onStartNodeChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start node" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNodes.map((node) => (
                      <SelectItem key={node} value={node}>
                        Node {node}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="speed">Animation Speed</Label>
                <div className="px-3">
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => onSpeedChange(value[0])}
                    max={2000}
                    min={100}
                    step={100}
                    className="w-full"
                    disabled={disabled}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base sm:text-lg">Playback Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {!isRunning ? (
                  <Button
                    onClick={onStart}
                    variant="default"
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                    disabled={!startNode || availableNodes.length === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button
                    onClick={isPaused ? onStart : onPause}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isPaused ? (
                      <><Play className="w-4 h-4 mr-2" />Resume</>
                    ) : (
                      <><Pause className="w-4 h-4 mr-2" />Pause</>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={onStop}
                  variant="destructive"
                  disabled={!isRunning && !isPaused}
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
