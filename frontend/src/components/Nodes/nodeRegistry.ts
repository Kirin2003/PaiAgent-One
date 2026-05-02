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
}

export const draggableNodeTypes: NodeTypeInfo[] = [
  {
    type: 'llm',
    label: 'LLM Node',
    icon: '\u{1F916}',
    color: 'var(--accent-blue)',
    description: 'Large language model',
  },
  {
    type: 'audioSynth',
    label: 'Audio Synthesis',
    icon: '\u{1F3B5}',
    color: 'var(--accent-purple)',
    description: 'Text-to-speech tool',
  },
];
