# legend-state-dev-tools

> **Early-stage project** -- I discovered Legend State recently and chose it for a project I was working on. It had everything I needed from a state manager, but I couldn't live without dev tools, so I built this. It appears to work, but it hasn't been thoroughly tested yet -- consider it a proof of concept for now.
>
> **Legend State v3 only** -- This tool was built specifically for Legend State v3 and does not work with older versions (v1/v2).

[![npm version](https://img.shields.io/npm/v/legend-state-dev-tools)](https://www.npmjs.com/package/legend-state-dev-tools)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Visual dev tools for Legend State v3 -- inspect and edit observable state in real time.

[**Live Demo →**](https://apperside.github.io/legend-state-dev-tools/)

<!-- screenshot -->

## Features

- Real-time state tree view powered by `json-edit-react`
- Inline editing of observable values
- Multiple color themes (dark and light variants)
- Draggable toolbar
- Configurable panel positioning (left or right)
- Read-only mode
- Clean teardown via `destroy()`

## Installation

```bash
npm install legend-state-dev-tools
```

```bash
pnpm add legend-state-dev-tools
```

```bash
yarn add legend-state-dev-tools
```

### Peer dependencies

| Package | Version |
|---------|---------|
| `@legendapp/state` | `>= 3.0.0-beta.0` |
| `react` | `>= 18.0.0` |
| `react-dom` | `>= 18.0.0` |

## Quick Start

```ts
import { observable } from '@legendapp/state';
import { init } from 'legend-state-dev-tools';
import 'legend-state-dev-tools/dist/styles.css';

const state$ = observable({ count: 0, user: { name: 'Alice' } });

const devtools = init(state$);

// Later, to clean up:
// devtools.destroy();
```

## API Reference

### `init(observable$, options?)`

Mounts the dev tools UI and returns a handle for cleanup.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `observable$` | `ObservableParam<any>` | The Legend State observable to inspect |
| `options` | `DevToolsOptions` | Optional configuration (see below) |

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the dev tools |
| `readOnly` | `boolean` | `false` | Prevent editing of state values |
| `theme` | `string` | `'githubDark'` | Color theme for the JSON editor |
| `rootName` | `string` | `'state$'` | Label shown as the root node name |
| `position` | `'left' \| 'right'` | `'right'` | Side of the screen for the panel |

**Returns**

```ts
{ destroy: () => void }
```

Call `destroy()` to unmount the toolbar, panel, and state subscription.

## Themes

The following themes are available (provided by `json-edit-react`):

| Theme key | Description |
|-----------|-------------|
| `githubDark` | GitHub dark (default) |
| `githubLight` | GitHub light |
| `monoDark` | Monochrome dark |
| `monoLight` | Monochrome light |

## Example

A working example is included in `examples/basic/`. To run it:

```bash
npm install
npm run dev
```

This builds the core package and starts the Vite dev server for the example app.

## Development

```bash
git clone <repo-url>
cd legend-state-dev-tools
npm install
npm run build   # build the core package
npm run dev     # build + start example dev server
```

## Architecture

The project is a monorepo with the main package in `packages/core/` and examples in `examples/`.

| Module | Path | Role |
|--------|------|------|
| `index` | `packages/core/src/index.ts` | Public API (`init`, options, lifecycle) |
| `state-bridge` | `packages/core/src/state-bridge.ts` | Subscribes to observables, produces snapshots, writes back edits |
| `json-editor-mount` | `packages/core/src/ui/json-editor-mount.tsx` | Mounts the `json-edit-react` editor with theme resolution |
| `panel` | `packages/core/src/ui/panel.ts` | Slide-out panel DOM management |
| `toolbar` | `packages/core/src/ui/toolbar.ts` | Draggable floating toolbar |
| `template-engine` | `packages/core/src/ui/template-engine.ts` | Lightweight HTML templating (Eta) |
| `styles` | `packages/core/src/styles.css` | Panel and toolbar CSS |

## Acknowledgments

A huge thank you to [Carlos](https://github.com/CarlosNZ) for creating [`json-edit-react`](https://github.com/CarlosNZ/json-edit-react) -- the excellent React component that powers the state tree viewer and editor in this project. Without it, these dev tools simply wouldn't exist.

## License

MIT
