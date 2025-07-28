import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, RotateCcw, Plus, RotateCw, RotateCcw as RotateCounterClockwise } from 'lucide-react';

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
}: ControlPanelProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Graph Controls</CardTitle>
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

          {/* <div className="flex gap-2">
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
          </div> */}

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
            disabled={disabled}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Graph
          </Button>
        </CardContent>
      </Card>

      {!renderGraphControlsOnly && (
        <>
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Traversal Settings</CardTitle>
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
            <CardHeader>
              <CardTitle className="text-foreground">Playback Controls</CardTitle>
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
