package com.paiagent.one.engine.executors;

import com.paiagent.one.engine.ExecutionContext;
import com.paiagent.one.engine.NodeExecutor;
import com.paiagent.one.model.dto.NodeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class AudioSynthExecutor implements NodeExecutor {

    @Override
    public String getType() {
        return "audio_synth";
    }

    @Override
    public void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) {
        // Get text from upstream node
        String text = "";
        for (String upstreamId : upstreamNodeIds) {
            Object upstreamOutput = context.getNodeOutput(upstreamId);
            if (upstreamOutput != null) {
                text = upstreamOutput.toString();
                break;
            }
        }

        log.info("AudioSynth (Mock): received text of length {}", text.length());

        // Mock: return a placeholder audio URL
        // Using a public domain sample audio for testing
        Map<String, Object> output = new HashMap<>();
        output.put("text", text);
        output.put("audioUrl", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");

        context.setNodeOutput(node.getId(), output);
    }
}
