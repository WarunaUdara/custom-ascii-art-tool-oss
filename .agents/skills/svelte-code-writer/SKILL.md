---
name: svelte-code-writer
description: "CLI tools and workflow for Svelte 5 documentation lookup and automated code analysis using @sveltejs/mcp. Use whenever creating or debugging Svelte components."
---

# Svelte Code Writer & Validator

Use the `@sveltejs/mcp` toolchain to look up current Svelte 5 APIs and validate components.

## CLI Lookup Tools

```bash
# List documentation sections
npx -y @sveltejs/mcp list-sections

# Get specific Svelte 5 documentation
npx -y @sveltejs/mcp get-documentation "$state,$derived,$effect"

# Svelte Autofixer / Static Analysis
npx -y @sveltejs/mcp svelte-autofixer ./src/components/studio/Studio.svelte
```

## Validation Protocol

1. Write or refactor Svelte 5 components using runes syntax.
2. If syntax ambiguity arises, query documentation via `get-documentation`.
3. Run `svelte-autofixer` to catch reactive traps or obsolete Svelte 4 patterns (`on:click`, `let:` slots, stores).
