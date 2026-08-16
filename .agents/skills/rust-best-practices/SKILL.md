---
name: rust-best-practices
description: "Guidelines and architecture for high-performance Rust development, WASM compilation (wasm-bindgen, wasm-pack), SIMD vectorization, and zero-cost abstractions for compute-heavy pipelines."
---

# Rust Best Practices & WASM Architecture

## Core Guidelines for Image & Video Compute

### 1. Memory Layout & Cache Locality
- Use contiguous, flat slices (`&[u8]`, `&mut [u8]`, `Vec<u8>`) instead of nested structs or heap-allocated rows.
- Ensure linear traversal of pixels ($Y \times \text{stride} + X$) to maximize CPU cache line hits and enable auto-vectorization.

### 2. WASM Interop via `wasm-bindgen`
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DitherEngine {
    width: u32,
    height: u32,
    buffer: Vec<u8>,
}

#[wasm_bindgen]
impl DitherEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            buffer: vec![0; (width * height * 4) as usize],
        }
    }

    /// Expose memory buffer directly to JavaScript without cloning
    pub fn buffer_ptr(&self) -> *const u8 {
        self.buffer.as_ptr()
    }

    pub fn dither_floyd_steinberg(&mut self) {
        // Sequential error diffusion kernel
    }
}
```

### 3. SIMD Acceleration in WASM
Compile with WASM SIMD enabled:
```toml
# Cargo.toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
```
Run with rustflags: `RUSTFLAGS="-C target-feature=+simd128" wasm-pack build --target web --release`
