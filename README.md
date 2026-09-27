# StudySnap

StudySnap is a small Android study companion that uses the Tether QVAC SDK to generate concise study guides directly on the device.

## Features

- On-device AI inference
- Topic-based study guides
- Short summaries and key points
- Quick-check question for review
- Streaming AI output
- Scrollable study results for mobile screens
- No cloud inference required

## QVAC SDK

- Package: `@qvac/sdk`
- Version: `0.20.0`

The QVAC Llama.cpp completion plugin is configured in `qvac.config.json`.

## Install

```bash
npm install
```

## Run

```bash
npx expo start
```

For the native Android build:

```bash
npx expo run:android --no-bundler
```

The first run downloads the local AI model.

## How it works

1. QVAC `loadModel` loads the local Llama model.
2. The student enters a study topic or selects a subject shortcut.
3. QVAC `completion` generates a concise study guide locally.
4. StudySnap streams the result into a scrollable study-guide panel.

All AI generation runs on-device.

## License

MIT License. See [LICENSE](LICENSE).
