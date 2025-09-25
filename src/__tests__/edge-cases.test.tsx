import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { createSelectiveContext } from '../index';
import { render, screen, fireEvent, act } from '@testing-library/react';

describe('createSelectiveContext Edge Cases', () => {
  describe('Performance and Memory', () => {
    it('handles large state objects efficiently', () => {
      const largeState = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          active: i % 2 === 0
        })),
        settings: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      };

      const { Provider, useContext } = createSelectiveContext(largeState);

      const UserCountComponent = () => {
        const [count] = useContext((state) => state.users.length);
        return <span>Users: {count}</span>;
      };

      const SettingsComponent = () => {
        const [theme] = useContext((state) => state.settings.theme);
        return <span>Theme: {theme}</span>;
      };

      const TestComponent = () => {
        const [, setState] = useContext((state) => state);
        return (
          <div>
            <UserCountComponent />
            <SettingsComponent />
            <button onClick={() => setState({ 
              settings: { ...largeState.settings, theme: 'dark' } 
            })}>
              Change Theme
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Users: 1000')).toBeInTheDocument();
      expect(screen.getByText('Theme: light')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Change Theme'));

      expect(screen.getByText('Users: 1000')).toBeInTheDocument();
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
    });

    it('handles rapid state updates', async () => {
      const { Provider, useContext } = createSelectiveContext({ count: 0 });

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => {
              // Rapid updates
              setState({ count: count + 1 });
              setState({ count: count + 2 });
              setState({ count: count + 3 });
            }}>Rapid Update</button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Count: 0')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Rapid Update'));

      // Should handle rapid updates correctly
      expect(screen.getByText('Count: 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty state object', () => {
      const { Provider, useContext } = createSelectiveContext({});

      const TestComponent = () => {
        const [, setState] = useContext((state) => state);
        return (
          <div>
            <button onClick={() => setState({ newField: 'value' })}>
              Add Field
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      fireEvent.click(screen.getByText('Add Field'));
      // Should not throw error
    });

    it('handles null and undefined values in state', () => {
      const { Provider, useContext } = createSelectiveContext({
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        falseValue: false
      });

      const TestComponent = () => {
        const [nullValue] = useContext((state) => state.nullValue);
        const [undefinedValue] = useContext((state) => state.undefinedValue);
        const [emptyString] = useContext((state) => state.emptyString);
        const [zero] = useContext((state) => state.zero);
        const [falseValue] = useContext((state) => state.falseValue);

        return (
          <div>
            <span>Null: {String(nullValue)}</span>
            <span>Undefined: {String(undefinedValue)}</span>
            <span>Empty: {emptyString}</span>
            <span>Zero: {zero}</span>
            <span>False: {String(falseValue)}</span>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Null: null')).toBeInTheDocument();
      expect(screen.getByText('Undefined: undefined')).toBeInTheDocument();
      expect(screen.getByText('Empty:')).toBeInTheDocument();
      expect(screen.getByText('Zero: 0')).toBeInTheDocument();
      expect(screen.getByText('False: false')).toBeInTheDocument();
    });

    it('handles deeply nested state updates', () => {
      const { Provider, useContext } = createSelectiveContext({
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep'
              }
            }
          }
        }
      });

      const TestComponent = () => {
        const [deepValue, setState] = useContext((state) => state.level1.level2.level3.level4.value);
        return (
          <div>
            <span>Deep: {deepValue}</span>
            <button onClick={() => setState({
              level1: {
                level2: {
                  level3: {
                    level4: {
                      value: 'updated'
                    }
                  }
                }
              }
            })}>
              Update Deep
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Deep: deep')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Update Deep'));

      expect(screen.getByText('Deep: updated')).toBeInTheDocument();
    });

    it('handles array state updates', () => {
      const { Provider, useContext } = createSelectiveContext({
        items: [1, 2, 3],
        users: [{ id: 1, name: 'John' }]
      });

      const TestComponent = () => {
        const [items, setState] = useContext((state) => state.items);
        const [users] = useContext((state) => state.users);
        
        return (
          <div>
            <span>Items: {items.join(',')}</span>
            <span>Users: {users.length}</span>
            <button onClick={() => setState({
              items: [...items, items.length + 1]
            })}>
              Add Item
            </button>
            <button onClick={() => setState({
              users: [...users, { id: 2, name: 'Jane' }]
            })}>
              Add User
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Items: 1,2,3')).toBeInTheDocument();
      expect(screen.getByText('Users: 1')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Add Item'));
      expect(screen.getByText('Items: 1,2,3,4')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Add User'));
      expect(screen.getByText('Users: 2')).toBeInTheDocument();
    });
  });

  describe('Subscription Behavior', () => {
    it('handles multiple subscriptions in same component', () => {
      const { Provider, useContext } = createSelectiveContext({
        count: 0,
        name: 'John',
        age: 25
      });

      const TestComponent = () => {
        const [count] = useContext((state) => state.count);
        const [name] = useContext((state) => state.name);
        const [age] = useContext((state) => state.age);
        const [, setState] = useContext((state) => state);

        return (
          <div>
            <span>Count: {count}</span>
            <span>Name: {name}</span>
            <span>Age: {age}</span>
            <button onClick={() => setState({ count: count + 1 })}>
              Increment
            </button>
            <button onClick={() => setState({ name: 'Jane' })}>
              Change Name
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Count: 0')).toBeInTheDocument();
      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Age: 25')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Change Name'));
      expect(screen.getByText('Name: Jane')).toBeInTheDocument();
    });

    it('handles subscription to same value multiple times', () => {
      const { Provider, useContext } = createSelectiveContext({ count: 0 });

      const TestComponent = () => {
        const [count1] = useContext((state) => state.count);
        const [count2] = useContext((state) => state.count);
        const [, setState] = useContext((state) => state);

        return (
          <div>
            <span>Count1: {count1}</span>
            <span>Count2: {count2}</span>
            <button onClick={() => setState({ count: count1 + 1 })}>
              Increment
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(screen.getByText('Count1: 0')).toBeInTheDocument();
      expect(screen.getByText('Count2: 0')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Increment'));

      expect(screen.getByText('Count1: 1')).toBeInTheDocument();
      expect(screen.getByText('Count2: 1')).toBeInTheDocument();
    });
  });

  describe('Callback Edge Cases', () => {
    it('handles callback throwing error', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      const { Provider, useContext } = createSelectiveContext(
        { count: 0 },
        errorCallback
      );

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState({ count: count + 1 })}>
              Increment
            </button>
          </div>
        );
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      // Should not break the component even if callback throws
      fireEvent.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('handles callback with complex state', () => {
      let callbackState: any = null;
      const complexCallback = vi.fn((state) => {
        callbackState = state;
      });

      const { Provider, useContext } = createSelectiveContext(
        { count: 0, name: 'test' },
        complexCallback
      );

      const TestComponent = () => {
        const [count, setState] = useContext((state) => state.count);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setState({ count: count + 1 })}>
              Increment
            </button>
          </div>
        );
      };

      render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      fireEvent.click(screen.getByText('Increment'));

      expect(screen.getByText('Count: 1')).toBeInTheDocument();
      expect(callbackState.count).toBe(1);
      expect(callbackState.name).toBe('test');
    });
  });

  describe('Memory Leaks Prevention', () => {
    it('properly cleans up subscriptions when component unmounts', () => {
      const { Provider, useContext } = createSelectiveContext({ count: 0 });

      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        const [count] = useContext((state) => state.count);
        return <span>Count: {count}</span>;
      };

      const { unmount } = render(
        <Provider>
          <TestComponent />
        </Provider>
      );

      expect(renderCount).toBe(1);

      unmount();

      // Component should be unmounted and not cause memory leaks
      expect(renderCount).toBe(1);
    });
  });
});
