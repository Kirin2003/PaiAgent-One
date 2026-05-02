import type { NodeTypes } from '@xyflow/react';
import UserInputNode from './UserInputNode';
import LLMNode from './LLMNode';
import AudioSynthNode from './AudioSynthNode';
import EndNode from './EndNode';

export const nodeTypes: NodeTypes = {
  userInput: UserInputNode,
  llm: LLMNode,
  audioSynth: AudioSynthNode,
  endNode: EndNode,
};

export interface NodeTypeInfo {
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: 'llm' | 'tool';
}

export const draggableNodeTypes: NodeTypeInfo[] = [
  {
    type: 'llm',
    label: 'LLM Node',
    icon: '🤖',
    color: 'var(--accent-blue)',
    description: 'Large language model',
    category: 'llm',
  },
  {
    type: 'audioSynth',
    label: 'Audio Synthesis',
    icon: '🎵',
    color: 'var(--accent-purple)',
    description: 'Text-to-speech tool',
    category: 'tool',
  },
];

export const nodeCategories = {
  llm: {
    label: 'LLM Nodes',
    description: 'AI model nodes',
  },
  tool: {
    label: 'Tool Nodes',
    description: 'Utility and processing nodes',
  },
};
