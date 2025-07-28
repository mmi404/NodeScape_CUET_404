import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface StatusPanelProps {
  algorithm: 'BFS' | 'DFS';
  currentStep: number;
  totalSteps: number;
  currentNode?: string;
  visitedNodes: string[];
  queuedNodes: string[];
  edges: { source: string; target: string }[];
  isRunning: boolean;
}

export const StatusPanel = ({
  algorithm,
  currentStep,
  totalSteps,
  currentNode,
  visitedNodes,
  queuedNodes,
  edges,
  isRunning,
}: StatusPanelProps) => {
  // Filter edges where both source and target are visited nodes
  const visitedEdges = edges.filter(
    (edge) => visitedNodes.includes(edge.source) && visitedNodes.includes(edge.target)
  );

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Algorithm Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Algorithm:</span>
            <Badge variant="outline" className="border-primary text-primary">
              {algorithm}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge 
              variant={isRunning ? "default" : "secondary"}
              className={isRunning ? "bg-node-visited" : ""}
            >
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="text-sm font-medium">{currentStep} / {totalSteps}</span>
          </div>

          {currentNode && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Node:</span>
              <Badge className="bg-node-current text-background">
                Node {currentNode}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Data Structures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {algorithm === 'BFS' ? 'Queue' : 'Stack'}:
              </span>
              <Badge variant="outline" className="text-xs">
                {queuedNodes.length} items
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[2rem] p-2 bg-muted rounded border">
              {queuedNodes.length > 0 ? (
                queuedNodes.map((node) => (
                  <Badge 
                    key={node} 
                    className="bg-node-queued text-background text-xs"
                  >
                    {node}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Empty</span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Visited Nodes:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 min-h-[2rem] p-2 bg-muted rounded border text-sm text-background">
              {visitedNodes.length > 0 ? (
                visitedNodes.map((node, index) => (
                  <span key={node} className="flex items-center">
                    <span className="bg-node-visited text-background text-xs px-2 py-1 rounded">{node}</span>
                    {index < visitedNodes.length - 1 && <span className="mx-1" style={{ color: 'white' }}>→</span>}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
