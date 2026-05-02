import { useCallback, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { executeWorkflow, createWorkflow } from '../api/workflowApi';

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
        // Save workflow first if no ID
        let id = workflowId;
        if (!id) {
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
