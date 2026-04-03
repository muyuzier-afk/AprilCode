# April Code

<p align="center">
  <a href="https://github.com/muyuzier-afk/AprilCode/actions/workflows/ci-cd.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/muyuzier-afk/AprilCode/ci-cd.yml?branch=main&label=build&style=for-the-badge" alt="Build Status" />
  </a>
  <a href="https://www.npmjs.com/package/@april-ai/april-code">
    <img src="https://img.shields.io/npm/v/%40april-ai%2Fapril-code?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@april-ai/april-code">
    <img src="https://img.shields.io/npm/dm/%40april-ai%2Fapril-code?style=for-the-badge" alt="npm downloads" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/muyuzier-afk/AprilCode?style=for-the-badge" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/runtime-Bun-black?style=for-the-badge" alt="Bun" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-43853d?style=for-the-badge" alt="Node >=18" />
</p>

April Code is a terminal-first coding agent for teams that want an OpenAI-compatible workflow without Anthropic-specific onboarding, telemetry, or credential storage defaults. It provides a Claude Code style CLI experience with April-specific branding, secure local configuration, and provider flexibility.

## Highlights

- First-run setup for `API Type`, `API Key`, `Base URL`, and `Model`
- Support for `Anthropic Messages`, `OpenAI Responses`, and `OpenAI Chat Completions`
- Compatible with OpenAI-like gateways and self-hosted endpoints
- Encrypted local storage for API keys and provider settings
- Default config directory at `~/.april`
- Telemetry disabled by default
- Green-themed CLI presentation and April Code command surface

## Installation

```bash
npm install -g @april-ai/april-code
```

After installation:

```bash
april
```

On first launch, April Code opens an interactive setup flow and stores credentials securely.

## Quick Start

1. Launch `april`
2. Select an API format:
   `anthropic`, `openai-responses`, or `openai-chat`
3. Enter:
   `API Key`, `Base URL`, `Model`
4. Start working in the current repository

You can update provider settings later with:

```bash
/provider
```

## Provider Examples

### Anthropic Messages

```text
API Type: anthropic
Base URL: https://api.anthropic.com
Model: claude-sonnet-4-5
```

### OpenAI-Compatible Responses API

```text
API Type: openai-responses
Base URL: https://example.com/v1
Model: gpt-4.1
```

### OpenAI-Compatible Chat Completions API

```text
API Type: openai-chat
Base URL: https://example.com/v1
Model: qwen-max
```

## Security Model

- Secrets are not stored in plaintext by default
- Provider configuration is persisted through secure storage
- Legacy Claude config can be migrated into `~/.april`
- Telemetry is opt-in through `APRIL_TELEMETRY_ENABLED=1`

## Development

```bash
bun install
bun run build
bun run smoke
```

## License

MIT. See [LICENSE](./LICENSE).
