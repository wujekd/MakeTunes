# Arrow Functions vs. `function` Declarations in JavaScript/TypeScript

> Quick reference for future-me while working on the audio engine project

---

## 1. Syntax & Intent

- **Traditional `function`** – `function add(a, b) { return a + b }`

- **Arrow (`=>`)** – `const add = (a, b) => a + b`

*Differences*
1. `function` is hoisted and can be called before its definition.
2. Arrow lives in a const/let/var binding; it exists only after the assignment line.
3. Arrow can omit the `return` keyword for one-liner expressions.
4. The arrow’s name comes from the variable, the function itself is anonymous.

## 2. `this` Binding

- `function` keyword ‑ `this` is **dynamic**: depends on how you call the function (`obj.method()`, `fn()`, `new Fn()`…).

- Arrow function ‑ `this` is **lexical**: whatever `this` was in the scope where the arrow was created.

Why it mattered for our UI callbacks: passing an arrow keeps `this` pointing to the object/closure that created it; no need for `.bind(this)`.

## 3. `arguments`

- `function` automatically receives the `arguments` pseudo-array.

- Arrow functions do **not**; use rest parameters `(...args)` instead.

## 4. Performance

Modern engines optimise both forms; pick based on readability and desired `this` behaviour, not speed.

---

## Module Scope Reminders

- Every ES module file is its **own scope**. Top-level variables are private unless exported.

- A plain file full of `const dom = …` already behaves like a singleton helper.

- A **factory function** (`createUI()`) returns a new object each time, effectively cloning that private scope for multiple independent instances.

```ts
// singleton style – one shared instance
auth-list.ts
const list = document.getElementById('player-1-list')!
export function populate(files: string[]) { /* … */ }
```

```ts
// factory style – many independent UIs
ui-factory.ts
export function createUI(root: HTMLElement) {
  const list = root.querySelector('ul')!
  return {
    populate(files: string[]) { /* … */ }
  }
}
```

Choose the pattern that matches how many instances you need and how you plan to test them.