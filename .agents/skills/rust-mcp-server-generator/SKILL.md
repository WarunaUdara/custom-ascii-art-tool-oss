---
name: rust-mcp-server-generator
description: "Instructions and templates for building native Model Context Protocol (MCP) servers in Rust using the rmcp crate with stdio and SSE transports."
---

# Rust MCP Server Generator

Guide for building custom high-performance Model Context Protocol (MCP) servers in Rust.

## Architecture

```toml
[dependencies]
rmcp = { version = "0.1", features = ["stdio", "server"] }
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## Basic Stdio Server Template

```rust
use rmcp::prelude::*;

#[derive(Clone)]
struct DitherServer;

#[rmcp::server]
impl DitherServer {
    #[tool(description = "Process an image with Floyd-Steinberg dithering")]
    async fn dither_image(&self, input_path: String, resolution: u32) -> Result<String, rmcp::Error> {
        Ok(format!("Processed {} at resolution {}", input_path, resolution))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let server = DitherServer;
    rmcp::transport::stdio::run(server).await?;
    Ok(())
}
```
