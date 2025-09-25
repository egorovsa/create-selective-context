# createSelectiveContext

[![npm version](https://badge.fury.io/js/create-selective-context.svg)](https://badge.fury.io/js/create-selective-context)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61dafb.svg)](https://reactjs.org/)

A lightweight React context factory that provides **selective subscriptions** to prevent unnecessary re-renders. Built with `useSyncExternalStore` for optimal performance and React 18+ compatibility.

**[🎮 Live Demo](https://egorovsa.github.io/create-selective-context/)**

## The Problem

Standard React Context causes all consuming components to re-render whenever any part of the context state changes, even if they only care about specific fields. This leads to performance issues in large applications.

```tsx
// Standard Context - ALL components re-render when ANY field changes
const [state, setState] = useContext(MyContext);
// Even if you only use state.count, you'll re-render when state.name changes
```

## The Solution

`createSelectiveContext` allows components to subscribe only to the specific parts of state they actually use, eliminating unnecessary re-renders.

```tsx
// Selective Context - Only re-render when subscribed fields change
const [count] = useContext((state) => state.count); // Only re-renders when count changes
const [name] = useContext((state) => state.name);   // Only re-renders when name changes
```

## Installation

```bash
npm install create-selective-context
# or
yarn add create-selective-context
```

## Quick Start

```tsx
import { createSelectiveContext } from 'create-selective-context';

// 1. Create your context
const { Provider, useContext } = createSelectiveContext({
  count: 0,
  name: '',
  isVisible: true
});

// 2. Provide the context
function App() {
  return (
    <Provider>
      <Counter />
      <NameDisplay />
    </Provider>
  );
}

// 3. Use with selective subscriptions
function Counter() {
  const [count, setState] = useContext((state) => state.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setState({ count: count + 1 })}>
        Increment
      </button>
    </div>
  );
}

function NameDisplay() {
  const [name, setState] = useContext((state) => state.name);
  
  return (
    <div>
      <p>Name: {name}</p>
      <input 
        value={name} 
        onChange={(e) => setState({ name: e.target.value })} 
      />
    </div>
  );
}
```

## API Reference

### `createSelectiveContext<State>(initialState, updateCallback?)`

Creates a selective context with the given initial state.

**Parameters:**
- `initialState` (State): The initial state object
- `updateCallback` (optional): Function called whenever state changes

**Returns:**
- `Provider`: React component to provide the context
- `useContext`: Hook for consuming the context with selectors

### `useContext<Output>(selector)`

Hook that subscribes to specific parts of the state.

**Parameters:**
- `selector` (state => Output): Function that selects the part of state you want to subscribe to

**Returns:**
- `[selectedValue, setState]`: Tuple with the selected value and state setter

**State Setter:**
The `setState` function accepts either:
- Partial state object: `setState({ count: 5 })`
- State updater function: `setState(state => ({ count: state.count + 1 }))`

## Advanced Examples

### Complex State Management

```tsx
interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
  };
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    currentPage: string;
  };
}

const { Provider, useContext } = createSelectiveContext<AppState>({
  user: { id: '', name: '', email: '' },
  settings: { theme: 'light', notifications: true },
  ui: { sidebarOpen: false, currentPage: 'home' }
});

// Subscribe to nested properties
function UserProfile() {
  const [user, setState] = useContext((state) => state.user);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Subscribe to specific nested field
function ThemeToggle() {
  const [theme, setState] = useContext((state) => state.settings.theme);
  
  return (
    <button 
      onClick={() => setState(state => ({
        settings: { ...state.settings, theme: theme === 'light' ? 'dark' : 'light' }
      }))}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} theme
    </button>
  );
}
```

### Computed Values

```tsx
function UserStats() {
  const [userCount] = useContext((state) => state.users.length);
  const [activeUsers] = useContext((state) => 
    state.users.filter(user => user.isActive).length
  );
  
  return (
    <div>
      <p>Total users: {userCount}</p>
      <p>Active users: {activeUsers}</p>
    </div>
  );
}
```

### With Update Callback

```tsx
const { Provider, useContext } = createSelectiveContext(
  { count: 0 },
  (newState) => {
    // Called whenever state changes
    console.log('State updated:', newState);
    // Could sync with localStorage, analytics, etc.
  }
);
```

## Performance Benefits

- **Selective Re-renders**: Components only re-render when their subscribed data changes
- **useSyncExternalStore**: Uses React's recommended pattern for external state
- **Zero Dependencies**: No external libraries required
- **TypeScript Support**: Full type safety and IntelliSense

## Migration from Standard Context

```tsx
// Before (Standard Context)
const MyContext = createContext();
const [state, setState] = useContext(MyContext);

// After (Selective Context)
const { useContext } = createSelectiveContext(initialState);
const [value, setState] = useContext((state) => state.specificField);
```

## Requirements

- React 18+
- Node.js 16+ (for development)
- TypeScript 4.5+ (for TypeScript projects)
- Modern browsers that support ES6+ and React 18+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.