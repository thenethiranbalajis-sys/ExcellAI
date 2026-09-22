# AI Providers

Each provider implements the shared AIProvider contract from core/ai/types.ts.

Provider implementations must:
- keep credentials out of the renderer;
- normalize provider-specific responses into shared types;
- expose model capabilities;
- surface typed errors;
- support cancellation where the provider permits it.

Planned providers include OpenAI, Gemini, Claude, local models, and future compatible providers.
