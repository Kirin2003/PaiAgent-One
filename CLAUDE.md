# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PaiAgent-One is an AI Agent Workflow Engine - a visual workflow builder for creating AI-powered automation pipelines. It features a React frontend with a node-based canvas (using React Flow) and a Spring Boot backend with a pluggable node execution engine.

## Build & Run Commands

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run -q          # Start backend server (port 8080)
mvn compile                     # Compile without running
mvn test                        # Run tests
```

### Frontend (React + Vite)
```bash
cd frontend
npm run dev                     # Start dev server (port 5173, proxies to backend)
npm run build                   # Production build
npm run lint                    # Run ESLint
```

### Full Stack Development
Start both servers for full development:
1. Backend: `cd backend && mvn spring-boot:run -q`
2. Frontend: `cd frontend && npm run dev`

Access the app at http://localhost:5173

## Architecture

### Backend: Workflow Engine
The backend uses a **pluggable executor pattern** for node execution:

- **WorkflowEngine** ([WorkflowEngine.java](backend/src/main/java/com/paiagent/one/engine/WorkflowEngine.java)): Executes workflows using topological sort (Kahn's algorithm). Emits SSE events for real-time frontend updates.
- **NodeExecutor interface** ([NodeExecutor.java](backend/src/main/java/com/paiagent/one/engine/NodeExecutor.java)): All node types implement this interface with `getType()` and `execute()`.
- **ExecutionContext**: Shared context passing data between nodes. Upstream node outputs are accessible via `context.getNodeOutput(nodeId)`.
- **Executors**: `LLMExecutor`, `UserInputExecutor`, `AudioSynthExecutor`, `EndExecutor` - each handles a specific node type.

Node types are defined in `NodeType` enum: `USER_INPUT`, `LLM`, `AUDIO_SYNTH`, `END`.

### Frontend: Visual Workflow Canvas
- **React Flow** (`@xyflow/react`): Drag-and-drop canvas for workflow visualization.
- **Zustand Store** ([workflowStore.ts](frontend/src/store/workflowStore.ts)): Central state management for nodes, edges, and execution state.
- **Node Registry** ([nodeRegistry.ts](frontend/src/components/Nodes/nodeRegistry.ts)): Maps frontend node types to components.
- **SSE Integration** ([workflowApi.ts](frontend/src/api/workflowApi.ts)): Uses fetch+EventSource pattern for real-time execution updates.

### Node Type Mapping
Frontend and backend use different naming conventions:
- Frontend: `userInput`, `llm`, `audioSynth`, `endNode`
- Backend: `user_input`, `llm`, `audio_synth`, `end`

Mapping is handled in `workflowStore.ts` via `nodeTypeToBackend` and `backendToNodeType`.

## Environment Configuration

Backend requires OpenAI-compatible API configuration (set in `application.yml` or environment):
- `OPENAI_API_KEY`: API key for LLM calls
- `OPENAI_BASE_URL`: Base URL (defaults to OpenAI, can be set to compatible endpoints)
- `OPENAI_MODEL`: Model name (default: `gpt-3.5-turbo`)

Database: H2 in-memory (access H2 console at `/h2-console` with JDBC URL `jdbc:h2:mem:paiagent`, user `sa`, empty password).