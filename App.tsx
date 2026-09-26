import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  completion,
  LLAMA_3_2_1B_INST_Q4_0,
  loadModel,
  unloadModel,
} from "@qvac/sdk";

export default function App() {
  const [modelId, setModelId] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading local AI model...");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadedModelId: string | null = null;

    async function startModel() {
      try {
        const id = await loadModel({
          modelSrc: LLAMA_3_2_1B_INST_Q4_0,
          onProgress: (progress) => {
            if (!cancelled) {
              setStatus("Downloading model...");
            }
          },
        });

        loadedModelId = id;

        if (!cancelled) {
          setModelId(id);
          setStatus("Local AI ready");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus("Failed to load local AI model");
        }
      }
    }

    startModel();

    return () => {
      cancelled = true;

      if (loadedModelId) {
        unloadModel({ modelId: loadedModelId }).catch(console.error);
      }
    };
  }, []);

  async function runPrompt() {
    if (!modelId || !prompt.trim() || running) {
      return;
    }

    setRunning(true);
    setResponse("");
    setStatus("Thinking locally...");

    try {
      const result = completion({
        modelId,
        history: [
          {
            role: "user",
            content: prompt.trim(),
          },
        ],
        stream: true,
      });

      let text = "";

      for await (const token of result.tokenStream) {
        text += token;
        setResponse(text);
      }

      setStatus("Local AI ready");
    } catch (error) {
      console.error(error);
      setResponse("Something went wrong while running the local model.");
      setStatus("Local AI error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Local Prompt</Text>

        <Text style={styles.subtitle}>
          AI inference running directly on this Android device
        </Text>

        <View style={styles.statusBox}>
          {modelId === null && <ActivityIndicator />}
          <Text style={styles.status}>{status}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          placeholderTextColor="#777"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          editable={!running}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!modelId || running || !prompt.trim()) && styles.buttonDisabled,
          ]}
          onPress={runPrompt}
          disabled={!modelId || running || !prompt.trim()}
        >
          <Text style={styles.buttonText}>
            {running ? "Thinking..." : "Run locally"}
          </Text>
        </TouchableOpacity>

        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Response</Text>
          <Text style={styles.response}>
            {response || "Your local AI response will appear here."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: "#444",
  },
  input: {
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  responseBox: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
    color: "#222",
  },
});
