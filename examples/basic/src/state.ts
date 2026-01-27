import { observable } from '@legendapp/state';

export const state$ = observable({
  count: 0,
  user: {
    name: 'Alice',
    email: 'alice@example.com',
    preferences: {
      darkMode: true,
      notifications: true,
    },
  },
  todos: [
    { id: 1, text: 'Learn Legend State', done: true },
    { id: 2, text: 'Try dev tools', done: false },
  ],
});
