# PaiAgent-One: AI Agent Workflow Panel Implementation Plan

## Context

构建一个完整的 AI Agent 工作流编辑器项目，包含可视化流图编辑面板、工作流引擎和调试面板。用户可以在画布上拖拽节点（大模型、工具等），连线组成工作流，并通过调试抽屉进行端到端测试。MVP 目标是：输入一段文字 -> LLM 生成播客脚本 -> (Mock)音频合成 -> 播放音频。

**技术选型：**
- 前端：React + TypeScript + React Flow + Zustand + Vite
- 后端：Spring Boot (Java 17) + H2 + Maven
- LLM：OpenAI 兼容接口
- TTS：暂不实现，Mock 返回示例音频

---

## Architecture

```
Browser (React + React Flow)
  ├── Sidebar (拖拽节点面板)
  ├── Canvas (React Flow 画布)
  └── DebugDrawer (调试抽屉)
        │
        │  REST + SSE
        ▼
Spring Boot Backend
  ├── WorkflowController (CRUD)
  ├── ExecutionController (SSE 执行流)
  └── WorkflowEngine (DAG 拓扑排序 + 顺序执行)
        ├── UserInputExecutor
        ├── LLMExecutor (OpenAI API)
        ├── AudioSynthExecutor (Mock)
        └── EndExecutor
```

---

## Directory Structure

```
PaiAgent-One/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   ├── global.css            # 暗色主题 CSS 变量
│       │   └── reactflow-overrides.css
│       ├── types/
│       │   └── workflow.ts           # TS 类型定义
│       ├── store/
│       │   └── workflowStore.ts      # Zustand 全局状态
│       ├── api/
│       │   └── workflowApi.ts        # 后端 API 封装
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── Sidebar.tsx
│       │   │   └── DraggableNode.tsx
│       │   ├── Canvas/
│       │   │   └── WorkflowCanvas.tsx
│       │   ├── Nodes/
│       │   │   ├── BaseNode.tsx       # 通用节点壳
│       │   │   ├── UserInputNode.tsx
│       │   │   ├── LLMNode.tsx
│       │   │   ├── AudioSynthNode.tsx
│       │   │   ├── EndNode.tsx
│       │   │   └── nodeRegistry.ts
│       │   ├── DebugDrawer/
│       │   │   ├── DebugDrawer.tsx
│       │   │   ├── DebugInput.tsx
│       │   │   ├── ExecutionLog.tsx
│       │   │   └── AudioPlayer.tsx
│       │   └── common/
│       │       └── IconButton.tsx
│       └── hooks/
│           ├── useDnD.ts
│           └── useDebugExecution.ts   # SSE 监听 Hook
│
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/paiagent/one/
│       ├── PaiAgentOneApplication.java
│       ├── config/
│       │   ├── WebConfig.java         # CORS
│       │   └── OpenAIConfig.java      # LLM 配置
│       ├── controller/
│       │   ├── WorkflowController.java
│       │   └── ExecutionController.java  # SSE 端点
│       ├── model/
│       │   ├── entity/WorkflowEntity.java
│       │   ├── dto/ (WorkflowDTO, NodeDTO, EdgeDTO, ExecutionRequest, ExecutionEvent)
│       │   └── enums/ (NodeType, ExecutionStatus)
│       ├── repository/
│       │   └── WorkflowRepository.java
│       ├── service/
│       │   ├── WorkflowService.java
│       │   └── ExecutionService.java
│       └── engine/
│           ├── WorkflowEngine.java      # DAG 拓扑排序 + 执行
│           ├── ExecutionContext.java
│           ├── NodeExecutor.java         # 接口
│           └── executors/
│               ├── UserInputExecutor.java
│               ├── LLMExecutor.java
│               ├── AudioSynthExecutor.java  # Mock
│               └── EndExecutor.java
```

---

## Core API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workflows` | 列出所有工作流 |
| GET | `/api/workflows/{id}` | 获取单个工作流 |
| POST | `/api/workflows` | 创建工作流 |
| PUT | `/api/workflows/{id}` | 更新工作流 |
| DELETE | `/api/workflows/{id}` | 删除工作流 |
| POST | `/api/workflows/{id}/execute` | 执行工作流 (返回 SSE 流) |

**SSE 事件格式：**
```
event: node-start     data: { "nodeId": "n1", "nodeType": "llm" }
event: node-complete  data: { "nodeId": "n1", "output": "..." }
event: node-error     data: { "nodeId": "n1", "error": "..." }
event: workflow-complete data: { "output": { "text": "...", "audioUrl": "..." } }
```

---

## Workflow Engine Logic

1. **解析** — 接收 WorkflowDTO，构建邻接表和入度表
2. **验证** — 检查唯一 UserInput/End 节点，检测无环 (DAG)
3. **拓扑排序** — Kahn 算法得到执行顺序
4. **顺序执行** — 按序调用 NodeExecutor，每步通过 SseEmitter 发送事件
5. **上下文传递** — ExecutionContext (HashMap) 存储 `{nodeId}.output`

---

## React Flow Custom Nodes

- **BaseNode**: 通用壳，包含头部(彩色)、内容区、Handle (左 target / 右 source)、执行状态徽章
- **UserInputNode**: 绿色头部，固定不可删除，只有 source handle
- **LLMNode**: 蓝色头部，可配置 model 和 systemPrompt，target + source handle
- **AudioSynthNode**: 紫色头部，Mock 标记，target + source handle
- **EndNode**: 红色头部，固定不可删除，只有 target handle

**默认工作流模板：**
```
[User Input] -> [LLM Node] -> [Audio Synthesis] -> [End]
```

---

## Debug Drawer Flow

1. 用户点击 "调试" 按钮 -> 抽屉从右侧滑出
2. 输入文本 -> 点击 "运行"
3. POST `/api/workflows/{id}/execute` -> 打开 SSE EventSource
4. 收到 `node-start` -> 对应画布节点显示蓝色 spinner
5. 收到 `node-complete` -> 节点显示绿色 checkmark，日志面板追加记录
6. 收到 `workflow-complete` -> AudioPlayer 出现，可播放 mock 音频

---

## Implementation Steps

### Step 1: Spring Boot 后端骨架
- 初始化 Spring Boot 项目 (Spring Web, JPA, H2, Lombok)
- 创建 model/entity/dto/enums
- 创建 WorkflowRepository + WorkflowService + WorkflowController (CRUD)
- 配置 CORS、application.yml
- **文件**: `pom.xml`, `PaiAgentOneApplication.java`, `WebConfig.java`, `WorkflowController.java`, `WorkflowService.java`, `WorkflowEntity.java`, `WorkflowRepository.java`, 所有 DTO/Enum

### Step 2: 工作流引擎
- 实现 NodeExecutor 接口 + ExecutionContext
- 实现 WorkflowEngine (Kahn 拓扑排序 + 顺序执行)
- 实现 4 个 Executor: UserInput, LLM (OpenAI), AudioSynth (Mock), End
- 创建 ExecutionController (SSE) + ExecutionService
- **文件**: `WorkflowEngine.java`, `NodeExecutor.java`, `ExecutionContext.java`, 4 个 Executor, `ExecutionController.java`, `ExecutionService.java`, `OpenAIConfig.java`

### Step 3: 前端骨架 + 画布
- 初始化 Vite + React + TS 项目
- 安装 reactflow, zustand, axios
- 创建暗色主题 CSS
- 实现 Zustand store (workflowStore)
- 实现 WorkflowCanvas + BaseNode + 4 个自定义节点 + nodeRegistry
- **文件**: `package.json`, `vite.config.ts`, `global.css`, `workflowStore.ts`, `WorkflowCanvas.tsx`, 所有 Node 组件

### Step 4: 侧边栏 + 拖拽
- 实现 Sidebar + DraggableNode
- 实现 useDnD hook (拖拽到画布)
- 搭建 App.tsx 布局 (Sidebar | Canvas | DebugDrawer)
- **文件**: `App.tsx`, `Sidebar.tsx`, `DraggableNode.tsx`, `useDnD.ts`

### Step 5: 调试抽屉 + SSE 集成
- 实现 DebugDrawer UI (DebugInput + ExecutionLog + AudioPlayer)
- 实现 useDebugExecution hook (SSE EventSource 监听)
- 接画布节点执行状态可视化
- 实现 API 封装 (workflowApi.ts)
- **文件**: `DebugDrawer.tsx`, `DebugInput.tsx`, `ExecutionLog.tsx`, `AudioPlayer.tsx`, `useDebugExecution.ts`, `workflowApi.ts`

### Step 6: 联调 + 收尾
- Vite proxy 配置 (`/api` -> `localhost:8080`)
- 前后端联调测试
- 添加 MiniMap / Controls
- 错误处理和 Toast 提示

---

## Verification

1. **后端验证**: 启动 Spring Boot，用 curl 测试 CRUD 接口和 SSE 执行流
2. **前端验证**: `npm run dev` 启动，确认画布渲染、节点拖拽、连线正常
3. **端到端**: 配置 OpenAI API Key，通过调试抽屉输入文本，观察 SSE 事件流、节点状态变化、音频播放
4. **编译检查**: 前端 `npm run build` 无错误，后端 `mvn compile` 无错误
