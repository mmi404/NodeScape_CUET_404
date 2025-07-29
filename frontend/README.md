# NodeScape – Graph Traversal Visualizer

## About
NodeScape is an interactive web-based visualization tool for graph traversal algorithms, specifically Breadth-First Search (BFS) and Depth-First Search (DFS). It allows users to create, edit, and visualize graphs with animated traversal steps, providing an educational and intuitive experience.

## Features
- Create and edit user-defined graphs with nodes and edges.
- Support for directed and undirected graphs.
- Visualize BFS and DFS traversal algorithms with step-by-step animation.
- Real-time display of traversal state including queue and stack.
- Undo and redo graph editing actions.
- Multiple graph input methods including manual input and example graphs.
- Responsive UI with control panels and status display.
- Context menu for node operations: rename, delete, and set as start node.
- Toast notifications for user feedback.
- Smooth animations and interactive graph canvas.

## Tech Stack
- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Radix UI components for accessible UI primitives
- React Router for routing
- React Query for state and data management
- @xyflow/react for graph state management
- Sonner and custom Toaster for notifications
- Framer Motion for animations
- Additional libraries: jspdf, recharts, date-fns, zod, and more

## Installation and Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mmi404/NodeScape_CUET_404.git
   cd NodeScape_CUET_404/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Usage

- Add nodes and edges to build your graph.
- Choose the traversal algorithm (BFS or DFS).
- Set the start node for traversal.
- Control traversal with start, pause, stop, and reset buttons.
- Use undo and redo to manage graph edits.
- Visualize traversal steps with animated highlighting of nodes and edges.
- Access example graphs for quick demonstrations.
- Use the context menu on nodes for additional actions.

## Project Structure

- `/src/components`: React components for UI and graph visualization.
- `/src/hooks`: Custom React hooks including graph traversal logic.
- `/src/lib`: Utility functions and graph algorithms.
- `/src/pages`: Application pages including the main Index page.
- `/public`: Static assets like icons and manifest files.
- `package.json`: Project metadata, dependencies, and scripts.
- `vite.config.ts`: Vite build and development server configuration.
- `Dockerfile`: Docker multi-stage build for containerized deployment.
- `nginx.conf`: Nginx configuration for serving the built app.

## Deployment

### Using Docker

Build and run the Docker container:

```bash
docker build -t nodescape-frontend .
docker run -p 80:80 nodescape-frontend
```

The app will be available at `http://localhost`.

### Using Nginx

1. Build the project:

```bash
npm run build
```

2. Copy the contents of the `dist` folder to your Nginx server's root directory (e.g., `/usr/share/nginx/html`).

3. Use the provided `nginx.conf` for SPA routing support.

4. Restart Nginx to apply the configuration.

## Future Enhancements

- Support for weighted graphs and algorithms like Dijkstra and A*.
- Save and load graphs from localStorage.
- Collaborative mode for multiple users.
- Dark mode for improved accessibility and aesthetics.

## License

This project is open source and available under the MIT License.
