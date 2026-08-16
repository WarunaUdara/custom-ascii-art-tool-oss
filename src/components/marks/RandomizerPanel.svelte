<script lang="ts">
  import type { RandomSwitchConfig } from '../../lib/tone-marks-engine';

  interface Props {
    randomConfig: RandomSwitchConfig;
    onupdateconfig: (partial: Partial<RandomSwitchConfig>) => void;
    ontrigger: () => void;
  }

  let {
    randomConfig = $bindable(),
    onupdateconfig,
    ontrigger,
  }: Props = $props();
</script>

<div class="randomizer-panel">
  <div class="panel-header">
    <div class="title-group">
      <span class="pulse-indicator"></span>
      <span class="header-title font-pixel">PROCEDURAL TONE SWITCHER</span>
    </div>
    <div class="hotkey-badge font-mono">HOTKEY: [Q]</div>
  </div>

  <div class="random-controls-box">
    <!-- Shuffle Action Button -->
    <button
      type="button"
      class="shuffle-btn font-pixel corner-ticks"
      onclick={ontrigger}
      title="Randomly switch midtones and marks across matrix (or press 'Q' key)"
    >
      <span class="tick-tl"></span>
      <span class="tick-tr"></span>
      <span class="tick-bl"></span>
      <span class="tick-br"></span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m16 3 4 4-4 4"/>
        <path d="M20 7H4"/>
        <path d="m8 21-4-4 4-4"/>
        <path d="M4 17h16"/>
      </svg>
      <span>TRIGGER SHUFFLE [PRESS Q]</span>
    </button>

    <!-- Sliders Grid -->
    <div class="sliders-list">
      <!-- Amount -->
      <div class="slider-field">
        <div class="slider-label font-mono">
          <span>AMOUNT (COVERAGE)</span>
          <span class="tabular-nums font-mono">{Math.round(randomConfig.amount * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1.0"
          step="0.05"
          value={randomConfig.amount}
          oninput={(e) => onupdateconfig({ amount: parseFloat((e.target as HTMLInputElement).value) })}
        />
      </div>

      <!-- Reach -->
      <div class="slider-field">
        <div class="slider-label font-mono">
          <span>REACH (TONE DISPERSION)</span>
          <span class="tabular-nums font-mono">±{randomConfig.reach} STEPS</span>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={randomConfig.reach}
          oninput={(e) => onupdateconfig({ reach: parseInt((e.target as HTMLInputElement).value) })}
        />
      </div>

      <!-- Auto Loop Timing -->
      <div class="slider-field">
        <div class="slider-label font-mono">
          <span>AUTO-LOOP INTERVAL</span>
          <span class="tabular-nums font-mono">{randomConfig.intervalMs}ms</span>
        </div>
        <input
          type="range"
          min="150"
          max="2500"
          step="50"
          value={randomConfig.intervalMs}
          oninput={(e) => onupdateconfig({ intervalMs: parseInt((e.target as HTMLInputElement).value) })}
        />
      </div>

      <!-- Auto Loop Toggle -->
      <div class="toggle-row">
        <span class="font-mono">CONTINUOUS CYCLE</span>
        <label class="switch">
          <input
            type="checkbox"
            checked={randomConfig.autoLoop}
            onchange={(e) => {
              const val = (e.target as HTMLInputElement).checked;
              onupdateconfig({ autoLoop: val, enabled: val });
            }}
          />
          <span class="slider-toggle"></span>
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .randomizer-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    color: #ededed;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pulse-indicator {
    width: 6px;
    height: 6px;
    background: #ff5b35;
    box-shadow: 0 0 6px rgba(255, 91, 53, 0.8);
  }

  .header-title {
    font-size: 11px;
    letter-spacing: 0.05em;
    color: #ffffff;
  }

  .hotkey-badge {
    font-size: 9px;
    color: #ff5b35;
    background: rgba(255, 91, 53, 0.1);
    border: 1px solid rgba(255, 91, 53, 0.3);
    padding: 2px 6px;
  }

  .random-controls-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #0d0d12;
    border: 1px solid #1f1f26;
    padding: 12px;
  }

  .shuffle-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #ff5b35;
    color: #000000;
    border: none;
    padding: 10px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .shuffle-btn:hover {
    background: #ff7454;
    box-shadow: 0 0 16px rgba(255, 91, 53, 0.35);
  }

  .sliders-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #71717a;
  }

  .slider-field input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: #1f1f26;
    outline: none;
  }

  .slider-field input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #ff5b35;
    cursor: pointer;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #a1a1aa;
    padding-top: 4px;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 28px;
    height: 14px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider-toggle {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1f1f26;
    transition: 0.15s;
  }

  .slider-toggle:before {
    position: absolute;
    content: '';
    height: 10px;
    width: 10px;
    left: 2px;
    bottom: 2px;
    background-color: #71717a;
    transition: 0.15s;
  }

  .switch input:checked + .slider-toggle {
    background-color: #ff5b35;
  }

  .switch input:checked + .slider-toggle:before {
    transform: translateX(14px);
    background-color: #000000;
  }
</style>
