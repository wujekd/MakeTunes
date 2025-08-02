# Imperative Engine ↔ React Layer: Callback-Injection Pattern

This document explains the architectural pattern we use to bridge a low-level, imperative **AudioEngine** with the declarative **React** UI.

---

## Why split the worlds?

*Imperative world*
- Tells the browser **how** to do things step-by-step. Examples: `audio.play()`, `canvas.drawRect()`, `map.setCenter()`
- Holds mutable objects (DOM nodes, `HTMLAudioElement`, WebGL contexts, etc.).
- Gives you very precise control but can make global state harder to reason about.

*React (declarative) world*
- Describes **what** the UI should look like for the current state. You return JSX; React diffs & updates the DOM.
- Stores state with hooks (`useState`, `useReducer`, context…). Renders are pure, side-effects go to `useEffect`.
- Keeps the UI consistent and predictable, but delegates low-level operations to imperative helpers.

Keeping these concerns separate makes the codebase testable, reusable, and easier to reason about.

---

## The Callback-Injection Pattern

1. **Create** the imperative object once (usually inside a React hook or context). Pass it a bag of callback props.
2. **Call** its methods via a `ref` whenever the user interacts with the UI.
3. **Notify** React via the injected callbacks. The engine stays framework-agnostic; React updates its own state and re-renders.

### Example

```ts
// AudioEngine.ts (imperative layer)
export type EngineEvents = {
  onState?: (s: 'playing' | 'paused' | 'stopped') => void;
  onTime?:  (t: number) => void;
};

export class AudioEngine {
  private audio = new Audio();
  private onState?: EngineEvents['onState'];
  private onTime?:  EngineEvents['onTime'];
  private tick?: number;

  constructor(events: EngineEvents = {}) {
    this.onState = events.onState;
    this.onTime  = events.onTime;
  }

  play(src: string) {
    this.audio.src = src;
    this.audio.play();
    this.onState?.('playing');
    this.startTicker();
  }
  pause() {
    this.audio.pause();
    this.onState?.('paused');
    this.stopTicker();
  }

  private startTicker() {
    this.tick = window.setInterval(() => this.onTime?.(this.audio.currentTime), 250);
  }
  private stopTicker() {
    if (this.tick) clearInterval(this.tick);
  }
}
```

```tsx
// usePlayerController.tsx (React layer)
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioEngine } from './AudioEngine';

export function usePlayerController() {
  const [state, setState] = useState<'idle'|'playing'|'paused'>('idle');
  const [time,  setTime ] = useState(0);

  const engineRef = useRef<AudioEngine>();

  // stable callbacks → will be handed to the engine
  const handleState = useCallback((s: 'playing' | 'paused' | 'stopped') => setState(s), []);
  const handleTime  = useCallback((t: number) => setTime(t), []);

  useEffect(() => {
    engineRef.current = new AudioEngine({ onState: handleState, onTime: handleTime });
    return () => engineRef.current?.pause(); // cleanup on unmount
  }, [handleState, handleTime]);

  // thin wrappers used by UI
  const play  = (src: string) => engineRef.current?.play(src);
  const pause = ()             => engineRef.current?.pause();

  return { state, time, play, pause };
}
```

```tsx
// PlayerButtons.tsx
const { play, pause, state } = usePlayerController();

<button onClick={() => play(selectedUrl)}>Play</button>
<button onClick={pause} disabled={state !== 'playing'}>Pause</button>
```

---

## Benefits

* **Loose coupling** – Engine can be replaced (Web Audio, Howler.js, native layer) without touching React.
* **Testability** – Engine can be unit-tested by passing spy callbacks; React components remain pure.
* **Single source of truth** – React state drives the UI; engine owns the imperative side effects.

Use this pattern whenever you need to bridge React with any non-React API such as Audio, Canvas, WebGL, or WebSocket. 

## Callback Flow Example

- UI (React component) registers callbacks with the **controller** (or directly with the UI helper).
- Controller translates user intent into imperative calls on the **AudioEngine** instance (`engine.loadAndPlay(...)`, `engine.setVolume(...)`).
- The engine can in turn expose events (`onEnded`, `onError`) that the controller subscribes to and forwards back up as React state updates.

This "callbacks-down / events-up" handshake keeps React declarative while letting the engine remain an isolated imperative module. 