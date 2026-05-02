import { useCallback, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { executeWorkflow, createWorkflow, updateWorkflow } from '../api/workflowApi';

export function useDebugExecution() {
  const abortRef = useRef<(() => void) | null>(null);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const startExecution = useWorkflowStore((s) => s.startExecution);
  const handleExecutionEvent = useWorkflowStore((s) => s.handleExecutionEvent);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);

  const run = useCallback(
    async (inputText: string) => {
      // Cancel any previous run
      abortRef.current?.();

      startExecution();

      try {
        // Always save/update workflow before execution
        let id = workflowId;
        try {
          if (id) {
            // Update existing workflow with current nodes/edges
            await updateWorkflow(id, workflowName, nodes, edges);
          } else {
            // Create new workflow
            const saved = await createWorkflow(workflowName, nodes, edges);
            id = saved.id!;
            setWorkflowId(id);
          }
        } catch (saveError) {
          // If update fails (e.g., workflow not found), create a new one
          console.warn('Failed to update workflow, creating new one:', saveError);
          const saved = await createWorkflow(workflowName, nodes, edges);
          id = saved.id!;
          setWorkflowId(id);
        }

        const abort = executeWorkflow(
          id,
          { text: inputText },
          (event) => {
            handleExecutionEvent(event);
          },
          (error) => {
            handleExecutionEvent({
              event: 'node-error',
              error,
            });
          },
          () => {
            // SSE stream ended
          }
        );
        abortRef.current = abort;
      } catch (err) {
        handleExecutionEvent({
          event: 'node-error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [workflowId, workflowName, nodes, edges, startExecution, handleExecutionEvent, setWorkflowId]
  );

  const cancel = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
  }, []);

  return { run, cancel };
}
