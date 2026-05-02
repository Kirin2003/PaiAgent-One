import { useWorkflowStore } from '../../store/workflowStore';
import { useMemo } from 'react';

interface OutputParam {
  id: string;
  name: string;
  type: 'input' | 'reference';
  value: string; // 输入值或引用的节点ID
}

interface OutputVariable {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface VariableField {
  key: string;
  label: string;
  type: string;
  description: string;
  required: boolean;
}

const nodeVariables: Record<string, VariableField[]> = {
  llm: [
    { key: 'model', label: 'Model', type: 'String', description: 'LLM 模型名称', required: true },
    { key: 'system_prompt', label: 'System Prompt', type: 'String', description: '系统提示词', required: false },
    { key: 'output', label: 'Output', type: 'String', description: 'LLM 输出内容', required: false },
  ],
  audioSynth: [
    { key: 'voice', label: 'Voice', type: 'String', description: '语音类型', required: true },
    { key: 'speed', label: 'Speed', type: 'Number', description: '语速 (0.5-2.0)', required: false },
    { key: 'output', label: 'Audio URL', type: 'String', description: '生成的音频链接', required: false },
  ],
};

const nodeTypeLabels: Record<string, string> = {
  userInput: '用户输入',
  llm: 'LLM 节点',
  audioSynth: '音频合成',
  endNode: '结束节点',
};

export default function NodeConfigPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div
        style={{
          width: 280,
          height: '100%',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          节点配置
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
            padding: 16,
            textAlign: 'center',
          }}
        >
          点击画布中的节点查看配置
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type || '';
  const variables = nodeVariables[nodeType] || [];
  const config = (selectedNode.data as { config?: Record<string, unknown>; label?: string }).config || {};
  const label = (selectedNode.data as { label?: string }).label || '';

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(selectedNodeId!, { label: newLabel });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    updateNodeData(selectedNodeId!, {
      config: { ...config, [key]: value },
    });
  };

  return (
    <div
      style={{
        width: 280,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>节点配置</span>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 18,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Node Name */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            节点名称
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 13,
              background: 'var(--bg-node)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Node Type */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            节点类型
          </label>
          <div
            style={{
              padding: '8px 10px',
              background: 'var(--bg-node)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          >
            {nodeTypeLabels[nodeType] || nodeType}
          </div>
        </div>

        {/* Variables Section (only for audioSynth) */}
        {nodeType === 'audioSynth' && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              变量
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {variables.map((variable) => (
                <div
                  key={variable.key}
                  style={{
                    background: 'var(--bg-node)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--accent-blue)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {variable.key}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 4,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {variable.type}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      marginBottom: 6,
                    }}
                  >
                    {variable.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={variable.required}
                      readOnly
                      style={{ cursor: 'default' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {variable.required ? '必要' : '可选'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node-specific Config */}
        {nodeType === 'llm' && (
          <LLMNodeConfig
            config={config}
            onConfigChange={handleConfigChange}
            selectedNodeId={selectedNodeId}
          />
        )}

        {nodeType === 'audioSynth' && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              配置
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                Voice
              </label>
              <select
                value={(config.voice as string) || 'alloy'}
                onChange={(e) => handleConfigChange('voice', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 13,
                  background: 'var(--bg-node)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="alloy">Alloy (中性)</option>
                <option value="echo">Echo (男声)</option>
                <option value="fable">Fable (英式)</option>
                <option value="onyx">Onyx (低沉男声)</option>
                <option value="nova">Nova (女声)</option>
                <option value="shimmer">Shimmer (柔和女声)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                Speed: {config.speed || 1.0}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={(config.speed as number) || 1.0}
                onChange={(e) => handleConfigChange('speed', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {nodeType === 'endNode' && (
          <EndNodeConfig
            config={config}
            onConfigChange={handleConfigChange}
            selectedNodeId={selectedNodeId}
          />
        )}

        {nodeType === 'userInput' && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              变量
            </div>

            <div
              style={{
                background: 'var(--bg-node)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--accent-blue)',
                    fontFamily: 'monospace',
                  }}
                >
                  user_input
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 4,
                    color: 'var(--text-muted)',
                  }}
                >
                  String
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <textarea
                  value={(config.defaultValue as string) || ''}
                  onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 13,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                  placeholder="用户本轮的输入内容"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked
                  readOnly
                  style={{ cursor: 'default' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  必要
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// EndNode 配置组件
interface EndNodeConfigProps {
  config: Record<string, unknown>;
  onConfigChange: (key: string, value: unknown) => void;
  selectedNodeId: string | null;
}

function EndNodeConfig({ config, onConfigChange, selectedNodeId }: EndNodeConfigProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  // 获取当前节点之前的所有节点及其输出变量
  const upstreamNodesWithOutputs = useMemo(() => {
    if (!selectedNodeId) return [];

    const visited = new Set<string>();
    const queue: string[] = [selectedNodeId];
    const result: { id: string; label: string; type: string; outputs: { key: string; label: string }[] }[] = [];

    // 定义每种节点类型的输出变量
    const nodeOutputs: Record<string, { key: string; label: string }[]> = {
      userInput: [{ key: 'user_input', label: '用户输入' }],
      llm: [{ key: 'output', label: 'LLM输出' }],
      audioSynth: [{ key: 'output', label: '音频URL' }],
    };

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      // 找到指向当前节点的边
      const incomingEdges = edges.filter((e) => e.target === currentId);
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode && !visited.has(sourceNode.id)) {
          queue.push(sourceNode.id);
          const nodeType = sourceNode.type || '';
          result.push({
            id: sourceNode.id,
            label: (sourceNode.data as { label?: string }).label || sourceNode.id,
            type: nodeType,
            outputs: nodeOutputs[nodeType] || [{ key: 'output', label: '输出' }],
          });
        }
      }
    }

    return result;
  }, [nodes, edges, selectedNodeId]);

  const outputParams = (config.outputParams as OutputParam[]) || [];
  const responseContent = (config.responseContent as string) || '';

  const addOutputParam = () => {
    const newParam: OutputParam = {
      id: `param_${Date.now()}`,
      name: '',
      type: 'input',
      value: '',
    };
    onConfigChange('outputParams', [...outputParams, newParam]);
  };

  const updateOutputParam = (id: string, updates: Partial<OutputParam>) => {
    const updated = outputParams.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    onConfigChange('outputParams', updated);
  };

  const removeOutputParam = (id: string) => {
    onConfigChange('outputParams', outputParams.filter((p) => p.id !== id));
  };

  const insertParamRef = (paramName: string) => {
    const insertion = `{{${paramName}}}`;
    onConfigChange('responseContent', responseContent + insertion);
  };

  return (
    <>
      {/* 输出配置 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            输出配置
          </span>
          <button
            onClick={addOutputParam}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            + 添加
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {outputParams.length === 0 && (
            <div
              style={{
                padding: 12,
                background: 'var(--bg-node)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-muted)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              点击"添加"创建输出参数
            </div>
          )}

          {outputParams.map((param, index) => (
            <div
              key={param.id}
              style={{
                background: 'var(--bg-node)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  参数 {index + 1}
                </span>
                <button
                  onClick={() => removeOutputParam(param.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* 参数名 */}
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) => updateOutputParam(param.id, { name: e.target.value })}
                  placeholder="参数名"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 参数类型 */}
              <div style={{ marginBottom: 8 }}>
                <select
                  value={param.type}
                  onChange={(e) => updateOutputParam(param.id, { type: e.target.value as 'input' | 'reference', value: '' })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="input">输入</option>
                  <option value="reference">引用</option>
                </select>
              </div>

              {/* 参数值 */}
              {param.type === 'input' ? (
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateOutputParam(param.id, { value: e.target.value })}
                  placeholder="输入值"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <select
                  value={param.value}
                  onChange={(e) => updateOutputParam(param.id, { value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">选择变量...</option>
                  {upstreamNodesWithOutputs.map((node) => (
                    <optgroup key={node.id} label={node.label}>
                      {node.outputs.map((output) => (
                        <option key={`${node.id}.${output.key}`} value={`${node.id}.${output.key}`}>
                          {output.key} ({output.label})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 回答内容配置 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          回答内容
        </div>

        {/* 可用参数提示 */}
        {outputParams.filter((p) => p.name).length > 0 && (
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            {outputParams
              .filter((p) => p.name)
              .map((param) => (
                <button
                  key={param.id}
                  onClick={() => insertParamRef(param.name)}
                  style={{
                    padding: '2px 8px',
                    fontSize: 11,
                    background: 'var(--accent-blue)20',
                    color: 'var(--accent-blue)',
                    border: '1px solid var(--accent-blue)40',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {`{{${param.name}}}`}
                </button>
              ))}
          </div>
        )}

        <textarea
          value={responseContent}
          onChange={(e) => onConfigChange('responseContent', e.target.value)}
          rows={5}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: 13,
            background: 'var(--bg-node)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            resize: 'vertical',
          }}
          placeholder="输入回答内容，使用 {{参数名}} 引用输出配置中的参数..."
        />
      </div>
    </>
  );
}

// LLM 节点配置组件
interface LLMNodeConfigProps {
  config: Record<string, unknown>;
  onConfigChange: (key: string, value: unknown) => void;
  selectedNodeId: string | null;
}

function LLMNodeConfig({ config, onConfigChange, selectedNodeId }: LLMNodeConfigProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  // 获取上游节点的输出变量
  const upstreamNodesWithOutputs = useMemo(() => {
    if (!selectedNodeId) return [];

    const visited = new Set<string>();
    const queue: string[] = [selectedNodeId];
    const result: { id: string; label: string; type: string; outputs: { key: string; label: string }[] }[] = [];

    const nodeOutputs: Record<string, { key: string; label: string }[]> = {
      userInput: [{ key: 'user_input', label: '用户输入' }],
      llm: [{ key: 'output', label: 'LLM输出' }],
      audioSynth: [{ key: 'output', label: '音频URL' }],
    };

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const incomingEdges = edges.filter((e) => e.target === currentId);
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode && !visited.has(sourceNode.id)) {
          queue.push(sourceNode.id);
          const nodeType = sourceNode.type || '';
          result.push({
            id: sourceNode.id,
            label: (sourceNode.data as { label?: string }).label || sourceNode.id,
            type: nodeType,
            outputs: nodeOutputs[nodeType] || [{ key: 'output', label: '输出' }],
          });
        }
      }
    }

    return result;
  }, [nodes, edges, selectedNodeId]);

  const inputParams = (config.inputParams as OutputParam[]) || [];
  const outputVariables = (config.outputVariables as OutputVariable[]) || [];
  const userPrompt = (config.userPrompt as string) || '';

  const addInputParam = () => {
    const newParam: OutputParam = {
      id: `input_${Date.now()}`,
      name: '',
      type: 'input',
      value: '',
    };
    onConfigChange('inputParams', [...inputParams, newParam]);
  };

  const updateInputParam = (id: string, updates: Partial<OutputParam>) => {
    const updated = inputParams.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    onConfigChange('inputParams', updated);
  };

  const removeInputParam = (id: string) => {
    onConfigChange('inputParams', inputParams.filter((p) => p.id !== id));
  };

  const addOutputVariable = () => {
    const newVar: OutputVariable = {
      id: `output_${Date.now()}`,
      name: '',
      type: 'String',
      description: '',
    };
    onConfigChange('outputVariables', [...outputVariables, newVar]);
  };

  const updateOutputVariable = (id: string, updates: Partial<OutputVariable>) => {
    const updated = outputVariables.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    onConfigChange('outputVariables', updated);
  };

  const removeOutputVariable = (id: string) => {
    onConfigChange('outputVariables', outputVariables.filter((v) => v.id !== id));
  };

  const insertParamRef = (paramName: string) => {
    const insertion = `{{${paramName}}}`;
    onConfigChange('userPrompt', userPrompt + insertion);
  };

  // 获取可用的参数名列表（用于提示词引用）
  const availableParams = inputParams.filter((p) => p.name);

  return (
    <>
      {/* 输入配置 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            输入配置
          </span>
          <button
            onClick={addInputParam}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            + 添加
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {inputParams.length === 0 && (
            <div
              style={{
                padding: 12,
                background: 'var(--bg-node)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-muted)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              点击"添加"创建输入参数，引用上游节点的输出
            </div>
          )}

          {inputParams.map((param, index) => (
            <div
              key={param.id}
              style={{
                background: 'var(--bg-node)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  输入 {index + 1}
                </span>
                <button
                  onClick={() => removeInputParam(param.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* 参数名 */}
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={param.name}
                  onChange={(e) => updateInputParam(param.id, { name: e.target.value })}
                  placeholder="参数名（如：input）"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 参数类型 */}
              <div style={{ marginBottom: 8 }}>
                <select
                  value={param.type}
                  onChange={(e) => updateInputParam(param.id, { type: e.target.value as 'input' | 'reference', value: '' })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="input">输入</option>
                  <option value="reference">引用</option>
                </select>
              </div>

              {/* 参数值 */}
              {param.type === 'input' ? (
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateInputParam(param.id, { value: e.target.value })}
                  placeholder="输入值"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <select
                  value={param.value}
                  onChange={(e) => updateInputParam(param.id, { value: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">选择变量...</option>
                  {upstreamNodesWithOutputs.map((node) => (
                    <optgroup key={node.id} label={node.label}>
                      {node.outputs.map((output) => (
                        <option key={`${node.id}.${output.key}`} value={`${node.id}.${output.key}`}>
                          {output.key} ({output.label})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 模型配置 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          模型配置
        </div>

        {/* 接口地址 */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            接口地址
          </label>
          <input
            type="text"
            value={(config.baseUrl as string) || ''}
            onChange={(e) => onConfigChange('baseUrl', e.target.value)}
            placeholder="https://api.openai.com/v1"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 13,
              background: 'var(--bg-node)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* API 密钥 */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            API 密钥
          </label>
          <input
            type="password"
            value={(config.apiKey as string) || ''}
            onChange={(e) => onConfigChange('apiKey', e.target.value)}
            placeholder="sk-..."
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 13,
              background: 'var(--bg-node)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* 温度 */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            温度: {config.temperature ?? 0.7}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={(config.temperature as number) ?? 0.7}
            onChange={(e) => onConfigChange('temperature', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            <span>精确 (0)</span>
            <span>创意 (2)</span>
          </div>
        </div>

        {/* 模型名称 */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            模型名称
          </label>
          <input
            type="text"
            value={(config.model as string) || ''}
            onChange={(e) => onConfigChange('model', e.target.value)}
            placeholder="gpt-3.5-turbo, gpt-4, claude-3-opus..."
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 13,
              background: 'var(--bg-node)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* 用户提示词 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          用户提示词
        </div>

        {/* 可用参数提示 */}
        {availableParams.length > 0 && (
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            {availableParams.map((param) => (
              <button
                key={param.id}
                onClick={() => insertParamRef(param.name)}
                style={{
                  padding: '2px 8px',
                  fontSize: 11,
                  background: 'var(--accent-blue)20',
                  color: 'var(--accent-blue)',
                  border: '1px solid var(--accent-blue)40',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                {`{{${param.name}}}`}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={userPrompt}
          onChange={(e) => onConfigChange('userPrompt', e.target.value)}
          rows={10}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: 13,
            background: 'var(--bg-node)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            resize: 'vertical',
            fontFamily: 'monospace',
          }}
          placeholder={`# 角色
你是一位专业的助手...

# 任务
...

# 原始内容：{{input}}`}
        />
      </div>

      {/* 输出参数配置 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            输出参数
          </span>
          <button
            onClick={addOutputVariable}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            + 添加
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {outputVariables.length === 0 && (
            <div
              style={{
                padding: 12,
                background: 'var(--bg-node)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-muted)',
                fontSize: 12,
                textAlign: 'center',
              }}
            >
              点击"添加"创建输出参数
            </div>
          )}

          {outputVariables.map((variable, index) => (
            <div
              key={variable.id}
              style={{
                background: 'var(--bg-node)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  输出 {index + 1}
                </span>
                <button
                  onClick={() => removeOutputVariable(variable.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* 变量名 */}
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => updateOutputVariable(variable.id, { name: e.target.value })}
                  placeholder="变量名（如：output）"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 变量类型 */}
              <div style={{ marginBottom: 8 }}>
                <select
                  value={variable.type}
                  onChange={(e) => updateOutputVariable(variable.id, { type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="String">String</option>
                </select>
              </div>

              {/* 描述 */}
              <div>
                <input
                  type="text"
                  value={variable.description}
                  onChange={(e) => updateOutputVariable(variable.id, { description: e.target.value })}
                  placeholder="描述（可选）"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
