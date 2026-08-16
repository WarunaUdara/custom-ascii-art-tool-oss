---
name: graphify
description: "Creates and queries knowledge graphs of codebases, AST structures, and dependency graphs. Use when exploring architecture, analyzing god nodes, or mapping project relationships."
---

# Graphify Codebase Graph Tool

`graphify` is installed via `graphifyy` on Python 3.14.

## Commands

```bash
# Generate knowledge graph for the current workspace
python3 -m graphify .

# Run with deep AST extraction
python3 -m graphify . --mode deep

# Update existing graph incrementally
python3 -m graphify . --update

# Query the existing graph
python3 -m graphify query "Explain the dithering pipeline data flow"
```

## Generated Outputs
- `graphify-out/graph.html`: Interactive force-directed web visualization.
- `graphify-out/GRAPH_REPORT.md`: God nodes, community clusters, and architectural health report.
- `graphify-out/graph.json`: Raw graph node & edge data for agentic traversal.
