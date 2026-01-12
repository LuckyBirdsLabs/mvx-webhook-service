# MultiversX Webhook Service

A high-performance webhook service for MultiversX Event Notifier

## Features

- **Real-time event processing**: connects to a MultiversX Event Notifier via WebSocket
- **Smart webhook delivery**: parallel webhook execution with retry logic and timeouts
- **Message signing**: every webhook payload is signed with a MultiversX wallet (`X-Signature`)
- **Flexible filtering**: filter by `address`, `identifier`, and first `topic` (base64 decoded)
- **Docker support**: ready for containerized deployment

## Requirements

- Node.js **24** (recommended, also used by the Docker image)
- npm

## Installation

Install dependencies:

```bash
npm install
```

## Configuration

Create the required config files:

```bash
cp .env.example .env
cp src/config/example.ts src/config/config.ts
```

### Environment variables

Edit `.env`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `EVENT_NOTIFIER_BASE_URL` | Yes | - | WebSocket URL of the Event Notifier (example: `wss://...`) |
| `SIGNATURE_WALLET_MNEMONIC` | Yes | - | MultiversX wallet mnemonic words, used to sign payloads |
| `EVENT_NOTIFIER_API_KEY` | No | - | API key, if your Event Notifier is protected |
| `EVENT_NOTIFIER_API_KEY_HEADER` | No | `Api-Key` | Header name used to send the API key |

### Tracked events configuration

Edit `src/config/config.ts`.

Each webhook entry supports:

- `name` (string, required): a human-readable name used in logs and payloads
- `url` (string, required): the HTTP URL endpoint to call (POST)
- `address` (optional): a single bech32 address string, or an array of addresses
- `identifier` (optional): event identifier to match
- `topic` (optional): matches the **first** event topic (after base64 decoding)
- `enabled` (optional): set to `false` to disable the webhook without removing it

Filtering logic: a webhook is triggered only if **all configured filters** (`address`, `identifier`, `topic`) match the incoming event.

You can find some examples in `src/config/example.ts`.

## Start the service

```bash
npm run start
```

## Checking payload signature

You can find a simple signature decoder in `src/check_signature.ts`.
