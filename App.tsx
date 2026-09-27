import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
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
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadedModelId: string | null = null;

    async function startModel() {
      try {
        const id = await loadModel({
          modelSrc: LLAMA_3_2_1B_INST_Q4_0,
          onProgress: () => {
            if (!cancelled) {
              setStatus("Downloading study model...");
            }
          },
        });

        loadedModelId = id;

        if (!cancelled) {
          setModelId(id);
          setStatus("StudySnap ready");
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

  async function createStudySnap() {
    if (!modelId || !topic.trim() || running) {
      return;
    }

    setRunning(true);
    setResponse("");
    setStatus("Creating study notes locally...");

    const studyPrompt = `You are StudySnap, a concise study companion.

Create a useful study guide for this topic: "${topic.trim()}"

Use exactly this structure:

SUMMARY:
Give a simple 2-3 sentence explanation.

KEY POINTS:
Give 3 short bullet points.

QUICK CHECK:
Give 1 short question the student can answer to test understanding.

Keep the language clear and beginner-friendly. Maximum 120 words. Do not add any text outside the three sections.`;

    try {
      const result = completion({
        modelId,
        history: [
          {
            role: "user",
            content: studyPrompt,
          },
        ],
        stream: true,
      });

      let text = "";

      for await (const token of result.tokenStream) {
        text += token;
        setResponse(text);
      }

      setStatus("StudySnap ready");
    } catch (error) {
      console.error(error);
      setResponse("Something went wrong while creating the study guide.");
      setStatus("StudySnap error");
    } finally {
      setRunning(false);
    }
  }

  function chooseTopic(value: string) {
    setTopic(value);
    setResponse("");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>StudySnap</Text>

        <Text style={styles.qvacBadge}>Powered by Tether QVAC</Text>

        <Text style={styles.subtitle}>
          Your private study companion, running AI locally on Android.
        </Text>

        <View style={styles.statusBox}>
          {modelId === null && <ActivityIndicator />}
          <Text style={styles.status}>{status}</Text>
        </View>

        <Text style={styles.sectionTitle}>What are you studying?</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Photosynthesis"
          placeholderTextColor="#777"
          value={topic}
          onChangeText={setTopic}
          editable={!running}
          multiline
        />

        <View style={styles.topicRow}>
          <TouchableOpacity
            style={styles.topicButton}
            onPress={() => chooseTopic("Photosynthesis")}
            disabled={running}
          >
            <Text style={styles.topicButtonText}>Biology</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicButton}
            onPress={() => chooseTopic("The solar system")}
            disabled={running}
          >
            <Text style={styles.topicButtonText}>Science</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topicButton}
            onPress={() => chooseTopic("World War II")}
            disabled={running}
          >
            <Text style={styles.topicButtonText}>History</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!modelId || running || !topic.trim()) && styles.buttonDisabled,
          ]}
          onPress={createStudySnap}
          disabled={!modelId || running || !topic.trim()}
        >
          <Text style={styles.buttonText}>
            {running ? "Creating study guide..." : "Create StudySnap"}
          </Text>
        </TouchableOpacity>

        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Study Guide</Text>

          <ScrollView style={styles.responseScroll}>
            <Text style={styles.response}>
            {response ||
              "Enter a topic to create a summary, key points, and a quick check question."}
            </Text>
          </ScrollView>
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
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 4,
  },
  qvacBadge: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    lineHeight: 23,
    marginBottom: 20,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: "#444",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    minHeight: 90,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    fontSize: 17,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  topicRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  topicButton: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  topicButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  responseBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    minHeight: 170,
    maxHeight: 250,
  },
  responseLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },
  responseScroll: {
    maxHeight: 180,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
    color: "#222",
  },
});










