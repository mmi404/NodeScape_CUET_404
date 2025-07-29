import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Node, Edge } from '@xyflow/react';
import { useMemo } from 'react';

interface GraphClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  classification?: {
    prediction: number;
    confidence: number;
    features?: any;
  };
}

const GraphClassificationModal = ({ 
  isOpen, 
  onClose, 
  nodes, 
  edges, 
  classification 
}: GraphClassificationModalProps) => {
  const stats = useMemo(() => {
    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};
    
    nodes.forEach(node => {
      inDegree[node.id] = 0;
      outDegree[node.id] = 0;
    });
    
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
    const colors = ['border-green-500 text-green-600', 'border-red-500 text-red-600', 'border-blue-500 text-blue-600'];
    return colors[prediction] || 'border-gray-500 text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Graph Classification Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Graph Classification */}
          {classification && (
            <Card className="bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg">AI Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Graph Type:</span>
                  <Badge 
                    variant="outline" 
                    className={`border-2 ${getClassificationColor(classification.prediction)} font-semibold`}
                  >
                    {getClassificationLabel(classification.prediction)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${classification.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {(classification.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graph Statistics */}
          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-lg">Graph Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nodes:</span>
                    <Badge variant="outline">{stats.nodeCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Edges:</span>
                    <Badge variant="outline">{stats.edgeCount}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Density:</span>
                    <span className="text-sm font-medium text-foreground">{stats.density.toFixed(3)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg In-Degree:</span>
                    <span className="text-sm font-medium text-foreground">{stats.avgInDegree.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Out-Degree:</span>
                    <span className="text-sm font-medium text-foreground">{stats.avgOutDegree.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max In/Out:</span>
                    <span className="text-sm font-medium text-foreground">{stats.maxInDegree}/{stats.maxOutDegree}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Node Degrees */}
          {nodes.length > 0 && (
            <Card className="bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg">Node Degrees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {nodes.map(node => (
                    <div key={node.id} className="flex justify-between items-center p-2 bg-muted rounded border text-sm">
                      <span className="font-medium text-foreground">Node {node.id}:</span>
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
      </DialogContent>
    </Dialog>
  );
};

export default GraphClassificationModal;