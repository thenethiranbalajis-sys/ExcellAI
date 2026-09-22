# AI Providers

ExcellAI is **cloud-AI first**. Local model runtimes are intentionally outside the current product scope.

Each provider implements the shared AIProvider contract from `core/ai/types.ts`.

Provider implementations must:
- keep credentials out of the renderer;
- normalize provider-specific responses into shared types;
- expose model capabilities;
- surface typed errors;
- support cancellation where the provider permits it;
- never hard-code API keys or secrets.

## Provider roadmap

1. OpenAI
2. Google Gemini
3. Anthropic Claude
4. Other compatible cloud providers

Local model adapters may be added in a future version without changing the application-level AI contracts.

## Security boundary

Renderer -> secure preload -> Electron main -> provider adapter -> cloud API.

API credentials belong on the trusted side of this boundary and must never be embedded in React source code or committed to Git.
