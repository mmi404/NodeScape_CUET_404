# Test Scenarios for BFS/DFS Graph Simulation

## 🧪 Comprehensive Testing Guide

### 1. **Directed vs Undirected Graph Testing**

#### Test Case 1.1: Basic Edge Creation
- **Setup**: Create nodes A, B, C
- **Action**: Toggle between directed/undirected mode
- **Expected**: 
  - Directed: Arrows visible on edges
  - Undirected: Plain lines, no arrows
  - Edge data contains correct `isDirected` flag

#### Test Case 1.2: Duplicate Edge Prevention
- **Setup**: Create nodes A, B in undirected mode
- **Action**: Create edge A→B, then try B→A
- **Expected**: Second edge should be prevented with toast notification

#### Test Case 1.3: Traversal Direction
- **Setup**: Create directed graph A→B→C
- **Action**: Run BFS from A
- **Expected**: Visits A, B, C in order
- **Setup**: Same graph in undirected mode
- **Expected**: Can traverse in both directions

### 2. **Input Method Testing**

#### Test Case 2.1: Matrix Input
```
Test Matrix (3x3):
0 1 0
0 0 1
1 0 0
```
- **Expected**: Creates cycle A→B→C→A

#### Test Case 2.2: Edge List Input
```
A B
B C
C D
D A
```
- **Expected**: Creates 4-node cycle

#### Test Case 2.3: Adjacency List Input
```
A: B C
B: D
C: D
D:
```
- **Expected**: Creates tree structure

#### Test Case 2.4: JSON Input
```json
{
  "directed": true,
  "nodes": [
    {"id": "A"},
    {"id": "B"},
    {"id": "C"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"}
  ]
}
```
- **Expected**: Creates directed path A→B→C

### 3. **BFS/DFS Algorithm Testing**

#### Test Case 3.1: BFS on Tree
- **Setup**: Binary tree with root A
```
    A
   / \
  B   C
 / \ / \
D  E F  G
```
- **Expected BFS**: A, B, C, D, E, F, G
- **Expected DFS**: A, B, D, E, C, F, G

#### Test Case 3.2: BFS on Cycle (Undirected)
- **Setup**: Cycle A-B-C-D-A
- **Expected**: All nodes visited, no infinite loop

#### Test Case 3.3: DFS on Directed Graph
- **Setup**: A→B→C, A→D→E
- **Expected**: Visits all reachable nodes from start

### 4. **Graph Classification Testing**

#### Test Case 4.1: Tree Classification
- **Setup**: Create tree structure (no cycles)
- **Action**: Click "Classify Graph"
- **Expected**: Classified as "Tree" with high confidence

#### Test Case 4.2: Cyclic Graph Classification
- **Setup**: Create cycle A→B→C→A
- **Action**: Click "Classify Graph"
- **Expected**: Classified as "Cyclic" with high confidence

#### Test Case 4.3: DAG Classification
- **Setup**: Create directed acyclic graph
- **Action**: Click "Classify Graph"
- **Expected**: Classified as "DAG" with high confidence

### 5. **User Interface Testing**

#### Test Case 5.1: Responsive Design
- **Action**: Test on mobile, tablet, desktop
- **Expected**: All controls accessible, proper layout

#### Test Case 5.2: Context Menu
- **Action**: Right-click on node
- **Expected**: Menu with delete, rename, add edge, set start options

#### Test Case 5.3: Undo/Redo
- **Action**: Create graph, perform undo/redo
- **Expected**: Graph state properly restored

### 6. **Export/Import Testing**

#### Test Case 6.1: JSON Export/Import
- **Action**: Create graph, export as JSON, import back
- **Expected**: Identical graph structure

#### Test Case 6.2: PDF Export
- **Action**: Create graph, export as PDF
- **Expected**: PDF contains graph visualization and analysis

#### Test Case 6.3: File Upload
- **Action**: Upload valid .json/.txt file
- **Expected**: Graph properly loaded

### 7. **Error Handling Testing**

#### Test Case 7.1: Invalid Input
- **Action**: Enter malformed JSON/edge list
- **Expected**: Clear error message, no crash

#### Test Case 7.2: Self-Loop Prevention
- **Action**: Try to create edge from node to itself
- **Expected**: Prevented with error message

#### Test Case 7.3: Backend Connection
- **Action**: Use text-to-graph with backend offline
- **Expected**: Graceful error handling

### 8. **Performance Testing**

#### Test Case 8.1: Large Graph
- **Setup**: Create graph with 50+ nodes
- **Expected**: Smooth performance, no lag

#### Test Case 8.2: Animation Speed
- **Action**: Test different animation speeds
- **Expected**: Responsive speed changes

## 🎯 Quick Test Checklist

- [ ] Directed/undirected toggle works
- [ ] All input methods create valid graphs
- [ ] BFS/DFS algorithms work correctly
- [ ] Graph classification provides results
- [ ] Export/import functions work
- [ ] Responsive design on all devices
- [ ] Error handling is graceful
- [ ] Performance is acceptable
- [ ] Visual feedback is clear
- [ ] Context menus function properly

## 🚀 Automated Testing Commands

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
python -m pytest

# Integration tests
npm run test:integration
```

## 📊 Expected Results Summary

1. **Graph Creation**: All input methods should create valid graph structures
2. **Visualization**: Proper visual distinction between directed/undirected
3. **Algorithms**: Accurate BFS/DFS traversal with correct path generation
4. **Classification**: AI model provides meaningful graph type predictions
5. **User Experience**: Smooth, responsive interface with helpful feedback
6. **Data Integrity**: Export/import maintains graph structure and properties

This comprehensive testing ensures the BFS/DFS simulation website functions correctly across all features and use cases.