import React from 'react';
import { observer } from '@legendapp/state/react';
import { state$ } from './state';

export const App = observer(function App() {
  // In Legend State v3, use .get() to subscribe to values
  const count = (state$.count as any).get();
  const userName = (state$.user.name as any).get();

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Legend State Dev Tools Demo</h1>
      <p>Open the dev tools panel using the floating button at the bottom-right.</p>

      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, color: '#1a1a1a' }}>
        <h2>Counter: {count}</h2>
        <button onClick={() => (state$.count as any).set((c: number) => c + 1)}>
          Increment
        </button>
        <button onClick={() => (state$.count as any).set(0)} style={{ marginLeft: 8 }}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, color: '#1a1a1a' }}>
        <h2>User: {userName}</h2>
        <input
          value={userName}
          onChange={(e) => (state$.user.name as any).set(e.target.value)}
          style={{ padding: '4px 8px', fontSize: 14 }}
        />
      </div>

      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, color: '#1a1a1a' }}>
        <h2>Todos</h2>
        <button
          onClick={() =>
            (state$.todos as any).push({
              id: Date.now(),
              text: `New todo ${Date.now()}`,
              done: false,
            })
          }
        >
          Add Todo
        </button>
      </div>
    </div>
  );
});
