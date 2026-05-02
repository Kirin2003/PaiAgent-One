import { useCallback, useRef } from 'react';

interface ReactFlowInstance {
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
}

export function useDnD(addNode: (type: string, position: { x: number; y: number }) => void) {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const setReactFlowInstance = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type');
      if (!type || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode]
  );

  return { onDragOver, onDrop, setReactFlowInstance };
}
