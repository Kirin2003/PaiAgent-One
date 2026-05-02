package com.paiagent.one.engine;

import java.util.HashMap;
import java.util.Map;

public class ExecutionContext {

    private final Map<String, Object> store = new HashMap<>();

    public void set(String key, Object value) {
        store.put(key, value);
    }

    public Object get(String key) {
        return store.get(key);
    }

    public String getString(String key) {
        Object val = store.get(key);
        return val != null ? val.toString() : null;
    }

    public void setNodeOutput(String nodeId, Object output) {
        store.put(nodeId + ".output", output);
    }

    public Object getNodeOutput(String nodeId) {
        return store.get(nodeId + ".output");
    }

    public String getNodeOutputString(String nodeId) {
        Object val = getNodeOutput(nodeId);
        return val != null ? val.toString() : null;
    }

    public Map<String, Object> getAllOutputs() {
        Map<String, Object> outputs = new HashMap<>();
        store.forEach((k, v) -> {
            if (k.endsWith(".output")) {
                outputs.put(k, v);
            }
        });
        return outputs;
    }
}
