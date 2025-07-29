import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Node, Edge } from '@xyflow/react';
import { useMemo } from 'react';

interface GraphStatsPanelProps {
  nodes: Node[];
  edges: Edge[];
  classification?: {
    prediction: number;
    confidence: number;
    features?: any;
  };
}

export const GraphStatsPanel = ({ nodes, edges, classification }: GraphStatsPanelProps) => {
  const stats = useMemo(() => {
    // Calculate in-degree and out-degree for each node
    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};
    
    // Initialize degrees
    nodes.forEach(node => {
      inDegree[node.id] = 0;
      outDegree[node.id] = 0;
    });
    
    // Calculate degrees from edges
    edges.forEach(edge => {
      outDegree[edge.source] = (outDegree[edge.source] || 0) + 1;
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    });
    
    const inDegreeValues = Object.values(inDegree);
    const outDegreeValues = Object.values(outDegree);
    
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      density: nodes.length > 1 ? (edges.length / (nodes.length * (nodes.length - 1))) : 0,
      avgInDegree: inDegreeValues.reduce((a, b) => a + b, 0) / nodes.length || 0,
      avgOutDegree: outDegreeValues.reduce((a, b) => a + b, 0) / nodes.length || 0,
      maxInDegree: Math.max(...inDegreeValues, 0),
      maxOutDegree: Math.max(...outDegreeValues, 0),
      inDegree,
      outDegree,
    };
  }, [nodes, edges]);

  const getClassificationLabel = (prediction: number) => {
    const labels = ['Tree', 'Cyclic', 'DAG'];
    return labels[prediction] || 'Unknown';
  };

  const getClassificationColor = (prediction: number) => {
    const colors = ['text-green-600', 'text-red-600', 'text-blue-600'];
    return colors[prediction] || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Graph Classification */}
      {classification && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Graph Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge 
                variant="outline" 
                className={`border-2 ${getClassificationColor(classification.prediction)}`}
              >
                {getClassificationLabel(classification.prediction)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className="text-sm font-medium">
                {(classification.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graph Statistics */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Graph Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nodes:</span>
              <Badge variant="outline">{stats.nodeCount}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Edges:</span>
              <Badge variant="outline">{stats.edgeCount}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Density:</span>
              <span className="text-sm font-medium">{stats.density.toFixed(3)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg In-Degree:</span>
              <span className="text-sm font-medium">{stats.avgInDegree.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Out-Degree:</span>
              <span className="text-sm font-medium">{stats.avgOutDegree.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max In-Degree:</span>
              <span className="text-sm font-medium">{stats.maxInDegree}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Out-Degree:</span>
              <span className="text-sm font-medium">{stats.maxOutDegree}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Degrees */}
      {nodes.length > 0 && (
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Node Degrees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nodes.map(node => (
                <div key={node.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Node {node.id}:</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      In: {stats.inDegree[node.id]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Out: {stats.outDegree[node.id]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};