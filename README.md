# Local Prompt

Local Prompt is a small Android app demonstrating on-device AI inference with the Tether QVAC SDK.

## Features

- AI inference runs directly on Android
- QVAC `loadModel` loads the local Llama model
- QVAC `completion` generates responses on-device
- Streaming response display
- Original prompt presets for quick experiments
- Concise preset prompts for a responsive mobile experience

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

1. QVAC `loadModel` loads the local model.
2. The user enters a prompt or selects a preset.
3. QVAC `completion` generates the response.
4. The response is displayed in the Android app.

AI generation runs locally on the device.

## License

MIT License. See [LICENSE](LICENSE).