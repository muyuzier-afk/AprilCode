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

### ClaudeaCode Private MCP/NAPI Compatibility Layer Progress

Below is the current status of compatibility layers related to Claude's private MCP and native/NAPI alternative implementations in the restored version. The distinction here is between **import/build readiness** and **whether runtime capabilities are actually restored**:

> **Special note:** This project is developed based on [https://github.com/xtherk/open-claude-code/](https://github.com/xtherk/open-claude-code/). As a result, some native ClaudeCode MCP features are not yet supported.

| Component | Current Progress | Usability |
| --- | --- | --- |
| `@ant/claude-for-chrome-mcp` | Minimal compatibility layer added; builds properly and exposes browser MCP tool definitions. | Can list tools, but read‑like interfaces return empty results or "unavailable"; **cannot** actually connect to the browser extension, establish a pairing session, or perform real browser bridging operations. |
| `@ant/computer-use-mcp` | Minimal compatibility layer added; main package and subpath exports are both in place. | Provides minimal state interfaces such as `request_access`, `list_granted_applications`, `current_display`, `switch_display`, `list_displays`. Real Computer Use actions (mouse, keyboard, screenshot, clipboard, etc.) are currently placeholders/unavailable. |
| `@ant/computer-use-input` | Minimal stub added. | Currently provides only a degraded semantic of `isSupported = false` to avoid missing‑package errors; **does not** provide real input injection capabilities. |
| `@ant/computer-use-swift` | Minimal native compatibility layer shape added for macOS. | Query interfaces for permissions, applications, displays, etc. return empty values or defaults; native capabilities such as screenshot, opening applications, and capture preparation are still not restored. |
| `image-processor-napi` | Replaced with `sharp` as an open‑source alternative; compat exports added. | Basic image reading, resizing, and compression are largely usable. However, `getNativeModule()` currently returns `null`, so logic that depends on the native fast path (e.g., image/clipboard operations) automatically falls back to existing fallbacks. |
| `color-diff-napi` | No longer depends on the native package; re‑implemented as local TypeScript. | Main structured diff and syntax highlighting pipelines are usable, but the implementation is based on `highlight.js`, not a 1:1 restoration of the original native stack. Details like `BAT_THEME` are still compatibility‑layer implementations. |
| `audio-capture-napi` | Minimal stub added to prevent voice features from crashing due to missing packages. | On Windows, real native recording backend is still unavailable. On Linux/macOS, the existing `arecord`/`rec` fallback paths are attempted, but this does **not** mean the original native recording capability has been restored. |

> In short: these compatibility layers are now sufficient for the source‑restored version to build, run the main workflow, and support code reading and interface comparison. Among them, `image-processor-napi` and `color-diff-napi` are relatively more restored, while browser, computer‑use, and native audio are still largely in a degraded state.

# Special Thanks: 

https://linux.do
https://github.com/xtherk/open-claude-code/


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
Model: gpt-5.4
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
