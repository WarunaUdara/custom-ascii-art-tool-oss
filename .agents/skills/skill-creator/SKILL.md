---
name: skill-creator
description: "Workflow and scaffolding rules for authoring new Antigravity agent skills, validating YAML frontmatter, structuring reference docs, and packaging executable helper scripts."
---

# Skill Creator Guidelines

## 1. Skill Folder Layout
Every skill must reside under `.agents/skills/<skill-name>/` with a required `SKILL.md`.

```text
skills/<skill_name>/
├── SKILL.md          # Required: Main instruction file with YAML frontmatter
├── scripts/          # Optional: Helper scripts
└── references/       # Optional: In-depth documentation
```

## 2. YAML Frontmatter Requirements
```yaml
---
name: unique-skill-name
description: "Specific description of what the skill does and when the agent should activate it."
---
```
