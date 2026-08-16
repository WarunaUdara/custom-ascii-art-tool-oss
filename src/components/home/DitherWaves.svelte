<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    waveSpeed?: number;
    waveFrequency?: number;
    waveAmplitude?: number;
    waveColor?: [number, number, number];
    colorNum?: number;
    pixelSize?: number;
    disableAnimation?: boolean;
    enableMouseInteraction?: boolean;
    mouseRadius?: number;
  }

  let {
    waveSpeed = 0.04,
    waveFrequency = 2.5,
    waveAmplitude = 0.32,
    waveColor = [1.0, 0.357, 0.208], // #ff5b35
    colorNum = 4.0,
    pixelSize = 2.0,
    disableAnimation = false,
    enableMouseInteraction = true,
    mouseRadius = 0.35,
  }: Props = $props();

  let canvasRef: HTMLCanvasElement | null = $state(null);
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let animFrameId: number | null = null;
  let startTime = Date.now();

  let mouseX = 0;
  let mouseY = 0;

  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = (position + 1.0) * 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 resolution;
    uniform float time;
    uniform float waveSpeed;
    uniform float waveFrequency;
    uniform float waveAmplitude;
    uniform vec3 waveColor;
    uniform vec2 mousePos;
    uniform int enableMouseInteraction;
    uniform float mouseRadius;
    uniform float colorNum;
    uniform float pixelSize;

    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float cnoise(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
      Pi = mod289(Pi);
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x, gy.x);
      vec2 g10 = vec2(gx.y, gy.y);
      vec2 g01 = vec2(gx.z, gy.z);
      vec2 g11 = vec2(gx.w, gy.w);
      vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
      g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
    }

    const int OCTAVES = 4;
    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 1.0;
      float freq = waveFrequency;
      for (int i = 0; i < OCTAVES; i++) {
        value += amp * abs(cnoise(p));
        p *= freq;
        amp *= waveAmplitude;
      }
      return value;
    }

    float pattern(vec2 p) {
      vec2 p2 = p - time * waveSpeed;
      return fbm(p + fbm(p2));
    }

    float getBayerValue(int index) {
      // 8x8 Bayer matrix matrix values normalized to [0..1]
      if (index == 0) return 0.0/64.0;
      if (index == 1) return 48.0/64.0;
      if (index == 2) return 12.0/64.0;
      if (index == 3) return 60.0/64.0;
      if (index == 4) return 3.0/64.0;
      if (index == 5) return 51.0/64.0;
      if (index == 6) return 15.0/64.0;
      if (index == 7) return 63.0/64.0;
      if (index == 8) return 32.0/64.0;
      if (index == 9) return 16.0/64.0;
      if (index == 10) return 44.0/64.0;
      if (index == 11) return 28.0/64.0;
      if (index == 12) return 35.0/64.0;
      if (index == 13) return 19.0/64.0;
      if (index == 14) return 47.0/64.0;
      if (index == 15) return 31.0/64.0;
      if (index == 16) return 8.0/64.0;
      if (index == 17) return 56.0/64.0;
      if (index == 18) return 4.0/64.0;
      if (index == 19) return 52.0/64.0;
      if (index == 20) return 11.0/64.0;
      if (index == 21) return 59.0/64.0;
      if (index == 22) return 7.0/64.0;
      if (index == 23) return 55.0/64.0;
      if (index == 24) return 40.0/64.0;
      if (index == 25) return 24.0/64.0;
      if (index == 26) return 36.0/64.0;
      if (index == 27) return 20.0/64.0;
      if (index == 28) return 43.0/64.0;
      if (index == 29) return 27.0/64.0;
      if (index == 30) return 39.0/64.0;
      if (index == 31) return 23.0/64.0;
      if (index == 32) return 2.0/64.0;
      if (index == 33) return 50.0/64.0;
      if (index == 34) return 14.0/64.0;
      if (index == 35) return 62.0/64.0;
      if (index == 36) return 1.0/64.0;
      if (index == 37) return 49.0/64.0;
      if (index == 38) return 13.0/64.0;
      if (index == 39) return 61.0/64.0;
      if (index == 40) return 34.0/64.0;
      if (index == 41) return 18.0/64.0;
      if (index == 42) return 46.0/64.0;
      if (index == 43) return 30.0/64.0;
      if (index == 44) return 33.0/64.0;
      if (index == 45) return 17.0/64.0;
      if (index == 46) return 45.0/64.0;
      if (index == 47) return 29.0/64.0;
      if (index == 48) return 10.0/64.0;
      if (index == 49) return 58.0/64.0;
      if (index == 50) return 6.0/64.0;
      if (index == 51) return 54.0/64.0;
      if (index == 52) return 9.0/64.0;
      if (index == 53) return 57.0/64.0;
      if (index == 54) return 5.0/64.0;
      if (index == 55) return 53.0/64.0;
      if (index == 56) return 42.0/64.0;
      if (index == 57) return 26.0/64.0;
      if (index == 58) return 38.0/64.0;
      if (index == 59) return 22.0/64.0;
      if (index == 60) return 41.0/64.0;
      if (index == 61) return 25.0/64.0;
      if (index == 62) return 37.0/64.0;
      return 21.0/64.0;
    }

    vec3 applyDither(vec2 pixelCoord, vec3 color) {
      int x = int(mod(pixelCoord.x / pixelSize, 8.0));
      int y = int(mod(pixelCoord.y / pixelSize, 8.0));
      int index = y * 8 + x;
      float threshold = getBayerValue(index) - 0.25;
      float step = 1.0 / (colorNum - 1.0);
      color += threshold * step;
      float bias = 0.2;
      color = clamp(color - bias, 0.0, 1.0);
      return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
    }

    void main() {
      // Pixelate the coordinate
      vec2 coord = floor(gl_FragCoord.xy / pixelSize) * pixelSize;
      vec2 uv = coord / resolution.xy;
      uv -= 0.5;
      uv.x *= resolution.x / resolution.y;

      float f = pattern(uv);

      if (enableMouseInteraction == 1) {
        vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
        mouseNDC.x *= resolution.x / resolution.y;
        float dist = length(uv - mouseNDC);
        float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
        f -= 0.5 * effect;
      }

      vec3 baseCol = mix(vec3(0.02, 0.02, 0.025), waveColor, clamp(f, 0.0, 1.0));
      vec3 ditheredCol = applyDither(gl_FragCoord.xy, baseCol);

      gl_FragColor = vec4(ditheredCol, 0.45); // Subtle translucent backdrop
    }
  `;

  function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
    const shader = glCtx.createShader(type);
    if (!shader) return null;
    glCtx.shaderSource(shader, source);
    glCtx.compileShader(shader);
    if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
      console.error(glCtx.getShaderInfoLog(shader));
      glCtx.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initWebGL() {
    if (!canvasRef) return;
    gl = canvasRef.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vShader || !fShader) return;

    program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    // Fullscreen quad
    const quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    resize();
    renderLoop();
  }

  function resize() {
    if (!canvasRef || !gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = canvasRef.clientWidth;
    const height = canvasRef.clientHeight;
    if (canvasRef.width !== width * dpr || canvasRef.height !== height * dpr) {
      canvasRef.width = width * dpr;
      canvasRef.height = height * dpr;
      gl.viewport(0, 0, canvasRef.width, canvasRef.height);
    }
  }

  function renderLoop() {
    if (!gl || !program || !canvasRef) return;

    resize();
    gl.useProgram(program);

    const elapsed = disableAnimation ? 0 : (Date.now() - startTime) * 0.001;

    // Set uniforms
    const uRes = gl.getUniformLocation(program, 'resolution');
    const uTime = gl.getUniformLocation(program, 'time');
    const uWaveSpeed = gl.getUniformLocation(program, 'waveSpeed');
    const uWaveFreq = gl.getUniformLocation(program, 'waveFrequency');
    const uWaveAmp = gl.getUniformLocation(program, 'waveAmplitude');
    const uWaveCol = gl.getUniformLocation(program, 'waveColor');
    const uMousePos = gl.getUniformLocation(program, 'mousePos');
    const uEnableMouse = gl.getUniformLocation(program, 'enableMouseInteraction');
    const uMouseRad = gl.getUniformLocation(program, 'mouseRadius');
    const uColorNum = gl.getUniformLocation(program, 'colorNum');
    const uPixelSize = gl.getUniformLocation(program, 'pixelSize');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    gl.uniform2f(uRes, canvasRef.width, canvasRef.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform1f(uWaveSpeed, waveSpeed);
    gl.uniform1f(uWaveFreq, waveFrequency);
    gl.uniform1f(uWaveAmp, waveAmplitude);
    gl.uniform3f(uWaveCol, waveColor[0], waveColor[1], waveColor[2]);
    gl.uniform2f(uMousePos, mouseX * dpr, mouseY * dpr);
    gl.uniform1i(uEnableMouse, enableMouseInteraction ? 1 : 0);
    gl.uniform1f(uMouseRad, mouseRadius);
    gl.uniform1f(uColorNum, colorNum);
    gl.uniform1f(uPixelSize, pixelSize * dpr);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animFrameId = requestAnimationFrame(renderLoop);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  onMount(() => {
    initWebGL();
    window.addEventListener('resize', resize);
  });

  onDestroy(() => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', resize);
  });
</script>

<div class="dither-waves-container" onmousemove={handleMouseMove} role="region" aria-label="Dither Wave Background">
  <canvas bind:this={canvasRef} class="dither-canvas"></canvas>
</div>

<style>
  .dither-waves-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    overflow: hidden;
    z-index: 1;
  }

  .dither-canvas {
    width: 100%;
    height: 100%;
    display: block;
    image-rendering: pixelated;
  }
</style>
