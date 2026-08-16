---
name: atomic-git-workflow
description: "Enforces atomic, modular, and highly granular Git commits following Conventional Commits standards. Use whenever making code changes, adding features, refactoring, or updating documentation to ensure clean, bisectable, and granular change history."
---

# Atomic & Modular Git Workflow

This skill establishes a strict atomic commit protocol for all development tasks. Each discrete logical milestone, interface definition, algorithm implementation, UI component, or documentation addition must be committed independently.

---

## 1. Core Principles of Atomic Commits

1. **One Logical Change per Commit**: A commit should represent a single, self-contained unit of work (e.g., creating a types file, implementing a specific dithering kernel, adding a slider component).
2. **High Granularity & Traceability**: Break down larger tasks into micro-milestones. Avoid large "batch" commits containing multiple unrelated features or layers.
3. **Always Compilable / Valid**: Each commit should leave the codebase in a valid, functional, or syntactically clean state.
4. **Conventional Commit Format**: Standardized prefix taxonomy for clear git history.

---

## 2. Commit Message Structure

Use the Conventional Commits format:
```text
<type>(<scope>): <imperative description>

[optional body explaining rationale or context]
```

### Commit Types

| Type | Scope / Purpose | Example |
| :--- | :--- | :--- |
| `feat` | New user-facing or programmatic capability | `feat(core): implement Bayer 8x8 matrix dithering kernel` |
| `refactor` | Code restructuring without feature addition | `refactor(engine): isolate color quantization logic` |
| `perf` | Performance or execution speed optimization | `perf(renderer): optimize typed array loop for cell brightness` |
| `style` | Layout, CSS, or visual component styling | `style(studio): refine control panel slider typography` |
| `docs` | Documentation, guides, or docstrings | `docs(algorithms): add mathematical explanation for Floyd-Steinberg` |
| `chore` | Build scripts, dependencies, or configuration | `chore(astro): configure Svelte 5 runes integration` |
| `test` | Unit tests or verification suites | `test(quantizer): add test coverage for 7-level palette mapping` |

---

## 3. Workflow Steps for Every Change

When implementing any task or feature:

1. **Identify Micro-Milestones**: Before coding, decompose the feature into small steps (e.g., Types $\rightarrow$ Algorithm Kernel $\rightarrow$ Renderer $\rightarrow$ UI Component $\rightarrow$ Docs).
2. **Execute Step 1**: Write or edit the single relevant file/module.
3. **Stage Specific Files**:
   ```bash
   git add <modified-file-or-dir>
   ```
4. **Commit with Clear Scope**:
   ```bash
   git commit -m "feat(scope): descriptive action message"
   ```
5. **Proceed to Next Micro-Milestone**: Repeat for each subsequent component or layer.

---

## 4. Examples of Granular Commits for Feature Work

Instead of a single commit like *"Add dithering tool"*, decompose into:

```bash
git commit -m "chore(config): initialize Astro with Svelte 5 and Starlight"
git commit -m "feat(core): define TypeScript data structures and engine types"
git commit -m "feat(core): implement color quantization and palette mapping"
git commit -m "feat(core): implement Floyd-Steinberg error diffusion algorithm"
git commit -m "feat(core): implement Bayer matrix ordered dithering"
git commit -m "feat(core): implement canvas ASCII glyph renderer"
git commit -m "feat(ui): create Svelte 5 CanvasStage component"
git commit -m "feat(ui): create Svelte 5 ControlsPanel component"
git commit -m "feat(studio): wire engine reactive state into Studio page"
git commit -m "docs(guides): document dithering algorithms and usage"
```
