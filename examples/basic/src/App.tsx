import React, { useState } from 'react';
import { observer } from '@legendapp/state/react';
import { state$ } from './state';

const COLORS = {
  bg: '#0f0f1a',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#e2e2e2',
  textMuted: '#888',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
};

const cardBase: React.CSSProperties = {
  background: COLORS.card,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: 16,
  padding: 28,
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const pillBtn = (color: string): React.CSSProperties => ({
  background: color,
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'opacity 0.15s',
});

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

export const App = observer(function App() {
  const count = (state$.count as any).get();
  const userName = (state$.user.name as any).get();
  const userEmail = (state$.user.email as any).get();
  const darkMode = (state$.user.preferences.darkMode as any).get();
  const notifications = (state$.user.preferences.notifications as any).get();
  const todos = (state$.todos as any).get();
  const [newTodo, setNewTodo] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f97316)',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 42, fontWeight: 800, color: '#fff' }}>
          Legend State Dev Tools
        </h1>
        <p style={{ margin: '12px 0 20px', fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>
          A powerful state inspector for Legend State v3
        </p>
        <a
          href="https://github.com/apperside/legend-state-dev-tools"
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...pillBtn('rgba(255,255,255,0.2)'), textDecoration: 'none', backdropFilter: 'blur(8px)' }}
        >
          GitHub →
        </a>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        {/* Counter Card */}
        <div style={{ ...cardBase, borderLeft: `4px solid ${COLORS.purple}` }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: COLORS.purple }}>Counter</h2>
          <div style={{ fontSize: 56, fontWeight: 800, margin: '16px 0', color: '#fff' }}>{count}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={pillBtn(COLORS.purple)} onClick={() => (state$.count as any).set((c: number) => c + 1)}>
              + Increment
            </button>
            <button
              style={pillBtn('#6b21a8')}
              onClick={() => (state$.count as any).set((c: number) => c - 1)}
            >
              − Decrement
            </button>
            <button
              style={{ ...pillBtn('transparent'), border: `1px solid ${COLORS.purple}`, color: COLORS.purple }}
              onClick={() => (state$.count as any).set(0)}
            >
              Reset
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div style={{ ...cardBase, borderLeft: `4px solid ${COLORS.pink}` }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.pink }}>User Profile</h2>
          <label style={{ display: 'block', fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Name</label>
          <input
            value={userName}
            onChange={(e) => (state$.user.name as any).set(e.target.value)}
            style={{ ...inputStyle, marginBottom: 12 }}
          />
          <label style={{ display: 'block', fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Email</label>
          <input
            value={userEmail}
            onChange={(e) => (state$.user.email as any).set(e.target.value)}
            style={{ ...inputStyle, marginBottom: 16 }}
          />
          {/* Toggles */}
          {[
            { label: 'Dark Mode', value: darkMode, path: state$.user.preferences.darkMode },
            { label: 'Notifications', value: notifications, path: state$.user.preferences.notifications },
          ].map((toggle) => (
            <div key={toggle.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>{toggle.label}</span>
              <div
                onClick={() => (toggle.path as any).set(!toggle.value)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: toggle.value ? COLORS.pink : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: toggle.value ? 23 : 3,
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Todo Card */}
        <div style={{ ...cardBase, borderLeft: `4px solid ${COLORS.orange}` }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.orange }}>Todo List</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTodo.trim()) {
                  (state$.todos as any).push({ id: Date.now(), text: newTodo.trim(), done: false });
                  setNewTodo('');
                }
              }}
              placeholder="Add a todo..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              style={pillBtn(COLORS.orange)}
              onClick={() => {
                if (!newTodo.trim()) return;
                (state$.todos as any).push({ id: Date.now(), text: newTodo.trim(), done: false });
                setNewTodo('');
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(todos as any[]).map((todo: any, i: number) => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => (state$.todos[i].done as any).set(!todo.done)}
                  style={{ accentColor: COLORS.orange, width: 16, height: 16, cursor: 'pointer' }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    textDecoration: todo.done ? 'line-through' : 'none',
                    color: todo.done ? COLORS.textMuted : COLORS.text,
                  }}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => {
                    const current = (state$.todos as any).get();
                    (state$.todos as any).set(current.filter((_: any, idx: number) => idx !== i));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.textMuted,
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px 24px',
          margin: '0 24px 24px',
          background: 'rgba(250, 204, 21, 0.12)',
          border: '1px solid rgba(250, 204, 21, 0.3)',
          borderRadius: 12,
          color: '#fde68a',
          fontSize: 14,
          maxWidth: 960,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        💡 Open the dev tools panel using the floating button at the bottom-right corner. The panel is draggable (grab the header) and resizable (drag the left edge).
      </div>
    </div>
  );
});
